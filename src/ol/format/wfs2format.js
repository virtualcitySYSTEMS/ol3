goog.provide('ol.format.WFS2');

goog.require('goog.asserts');
goog.require('goog.dom.NodeType');
goog.require('ol');
goog.require('ol.format.XMLFeature');
goog.require('ol.xml');
goog.require('ol.format.CityGML');

/**
 * @classdesc
 * Feature format for reading data in the WFS2 format.
 * Currently only reads in CityGML2.0 and only parses a getFeature response
 *
 * @constructor
 * @extends {ol.format.XMLFeature}
 * @api stable
 */
ol.format.WFS2 = function () {

  /**
   * @private
   * @type {ol.format.CityGML}
   */
  this.cityGMLFormat_ = new ol.format.CityGML();

  /**
   * @private
   * @type {string}
   */
  this.schemaLocation_ = ol.format.WFS2.SCHEMA_LOCATION;

  /**
   * @type {Object.<string, Object.<string, Object>>}
   */
  this.FEATURE_COLLECTION_PARSERS = {};

  this.FEATURE_COLLECTION_PARSERS[ol.format.WFS2.WFS2NS] = {
    'member': ol.xml.makeArrayPusher(this.handleWFSMember)
  };

  goog.base(this);
};
goog.inherits(ol.format.WFS2, ol.format.XMLFeature);

/**
 * @const
 * @type {string}
 */
ol.format.WFS2.XMLNS = 'http://www.w3.org/2000/xmlns/';

/**
 * @const
 * @type {string}
 */
ol.format.WFS2.WFS2NS = 'http://www.opengis.net/wfs/2.0';

/**
 * @const
 * @type {string}
 */
ol.format.WFS2.SCHEMA_LOCATION = ol.format.WFS2.WFS2NS + ' http://schemas.opengis.net/wfs/2.0/wfs.xsd';

/**
 * Read all features from a WFS FeatureCollection.
 *
 * @function
 * @param {Document|Node|Object|string} source Source.
 * @param {olx.format.ReadOptions=} opt_options Read options.
 * @return {Array.<ol.Feature>} Features.
 * @api stable
 */
ol.format.WFS2.prototype.readFeatures;

/**
 * @inheritDoc
 */
ol.format.WFS2.prototype.readFeaturesFromNode = function (node, opt_options) {

  var objectStack = [];

  var features = ol.xml.pushParseAndPop([], this.FEATURE_COLLECTION_PARSERS, node, objectStack, this);
  if (!features) {
    features = [];
  }
  return features;
};

/**
 * @param {Node} node Node.
 * @param {Array.<*>} objectStack Object stack.
 * @return {Array.<ol.Feature>} Features.
 */
ol.format.WFS2.prototype.handleWFSMember = function (node, objectStack) {
  goog.asserts.assert(node.nodeType == goog.dom.NodeType.ELEMENT, 'node.nodeType should be ELEMENT');
  //var localName = ol.xml.getLocalName(node);
  var feature = ol.xml.pushParseAndPop([], this.cityGMLFormat_.TOP_LEVEL_FEATURE_PARSERS, node, objectStack, this.cityGMLFormat_);
  return feature;
};


/**
 * Encode format as WFS `GetFeature` and return the Node.
 *
 * @param {olx.format.WFSWriteGetFeatureOptions} options Options.
 * @return {Node} Result.
 * @api stable
 */
ol.format.WFS2.prototype.writeGetFeature = function (options) {
  var node = ol.xml.createElementNS('http://www.opengis.net/wfs/2.0',
    'GetFeature');
  node.setAttribute('service', 'WFS');
  node.setAttribute('version', '2.0.0');
  var filter;
  if (options) {
    if (options.handle) {
      node.setAttribute('handle', options.handle);
    }
    if (options.outputFormat) {
      node.setAttribute('outputFormat', options.outputFormat);
    }
    if (options.maxFeatures !== undefined) {
      node.setAttribute('maxFeatures', options.maxFeatures);
    }
    if (options.resultType) {
      node.setAttribute('resultType', options.resultType);
    }
    if (options.startIndex !== undefined) {
      node.setAttribute('startIndex', options.startIndex);
    }
    if (options.count !== undefined) {
      node.setAttribute('count', options.count);
    }
    filter = options.filter;
    if (options.bbox) {
      goog.asserts.assert(options.geometryName,
        'geometryName must be set when using bbox filter');
      var bbox = ol.format.ogc.filter.bbox(
        options.geometryName, options.bbox, options.srsName);
      if (filter) {
        // if bbox and filter are both set, combine the two into a single filter
        filter = ol.format.ogc.filter.and(filter, bbox);
      } else {
        filter = bbox;
      }
    }
  }
  ol.xml.setAttributeNS(node, 'http://www.w3.org/2001/XMLSchema-instance',
    'xsi:schemaLocation', this.schemaLocation_);
  if (options.allNs){
    for (var ns in options.allNs){
      if (options.allNs.hasOwnProperty(ns)){
        //TODO this is a temporary solution to deal with ie11
        //TODO after stringifying the node, the "__--__" is regexed into a ":"
        //TODO should be replaced with a more elegant solution soon
        node.setAttribute('xmlns__--__' + ns, options.allNs[ns]);
        //ol.xml.setAttributeNS(node, ol.format.WFS2.XMLNS, 'xmlns:' + ns,options.allNs[ns]);
      }
    }
  }
  var context = {
    node: node,
    srsName: options.srsName,
    featureNS: options.featureNS ? options.featureNS : this.featureNS_,
    featurePrefix: options.featurePrefix,
    geometryName: options.geometryName,
    filter: filter,
    propertyNames: options.propertyNames ? options.propertyNames : []
  };
  goog.asserts.assert(Array.isArray(options.featureTypes),
    'options.featureTypes should be an array');
  ol.format.WFS2.writeGetFeature_(node, options.featureTypes, [context]);
  return node;
};

/**
 * @param {Node} node Node.
 * @param {Array.<{string}>} featureTypes Feature types.
 * @param {Array.<*>} objectStack Node stack.
 * @private
 */
ol.format.WFS2.writeGetFeature_ = function (node, featureTypes, objectStack) {
  var context = objectStack[objectStack.length - 1];
  goog.asserts.assert(goog.isObject(context), 'context should be an Object');
  var item = ol.object.assign({}, context);
  item.node = node;
  ol.xml.pushSerializeAndPop(item,
    ol.format.WFS2.GETFEATURE_SERIALIZERS_,
    ol.xml.makeSimpleNodeFactory('Query'), featureTypes,
    objectStack);
};

/**
 * @param {Node} node Node.
 * @param {string} featureType Feature type.
 * @param {Array.<*>} objectStack Node stack.
 * @private
 */
ol.format.WFS2.writeQuery_ = function (node, featureType, objectStack) {
  var context = objectStack[objectStack.length - 1];
  goog.asserts.assert(goog.isObject(context), 'context should be an Object');
  var featurePrefix = context['featurePrefix'];
  var featureNS = context['featureNS'];
  var propertyNames = context['propertyNames'];
  var srsName = context['srsName'];
  var prefix = featurePrefix ? featurePrefix + ':' : '';
  node.setAttribute('typeNames', "schema-element(" + prefix + featureType + ")");
  if (srsName) {
    node.setAttribute('srsName', srsName);
  }
  if (featureNS) {
    ol.xml.setAttributeNS(node, ol.format.WFS2.XMLNS, 'xmlns:' + featurePrefix,
      featureNS);
  }
  var item = ol.object.assign({}, context);
  item.node = node;
  ol.xml.pushSerializeAndPop(item,
    ol.format.WFS2.QUERY_SERIALIZERS_,
    ol.xml.makeSimpleNodeFactory('PropertyName'), propertyNames,
    objectStack);
  var filter = context['filter'];
  if (filter) {
    var child = ol.xml.createElementNS('http://www.opengis.net/fes/2.0', 'Filter');
    node.appendChild(child);
    ol.format.WFS2.writeFilterCondition_(child, filter, objectStack);
  }
};

/**
 * @param {Node} node Node.
 * @param {ol.format.ogc.filter.Filter} filter Filter.
 * @param {Array.<*>} objectStack Node stack.
 * @private
 */
ol.format.WFS2.writeBboxFilter_ = function(node, filter, objectStack) {
  goog.asserts.assertInstanceof(filter, ol.format.ogc.filter.Bbox,
    'must be bbox filter');

  var context = objectStack[objectStack.length - 1];
  goog.asserts.assert(goog.isObject(context), 'context should be an Object');
  context.srsName = filter.srsName;

  var item = ol.object.assign({}, context);
  item.node = node;
  ol.xml.pushSerializeAndPop(item,
    ol.format.WFS2.FILTER_SERIALIZERS,
    ol.xml.makeSimpleNodeFactory('ValueReference'), [filter.geometryName],
    objectStack);
  ol.format.GML3.prototype.writeGeometryElement(node, filter.extent, objectStack);
};

/**
 * @param {Node} node Node.
 * @param {ol.format.ogc.filter.Filter} filter Filter.
 * @param {Array.<*>} objectStack Node stack.
 * @private
 */
ol.format.WFS2.writeWithinFilter_ = function(node, filter, objectStack) {
  goog.asserts.assertInstanceof(filter, ol.format.ogc.filter.Within,
    'must be within filter');

  var context = objectStack[objectStack.length - 1];
  goog.asserts.assert(goog.isObject(context), 'context should be an Object');
  context.srsName = filter.srsName;

  var item = ol.object.assign({}, context);
  item.node = node;
  ol.xml.pushSerializeAndPop(item,
    ol.format.WFS2.FILTER_SERIALIZERS,
    ol.xml.makeSimpleNodeFactory('ValueReference'), [filter.valueReference],
    objectStack);
  ol.format.GML3.prototype.writeGeometryElement(node, filter.polygon, objectStack);
};

/**
 * @param {Node} node Node.
 * @param {ol.format.ogc.filter.Filter} filter Filter.
 * @param {Array.<*>} objectStack Node stack.
 * @private
 */
ol.format.WFS2.writeDWithinFilter_ = function(node, filter, objectStack) {
  goog.asserts.assertInstanceof(filter, ol.format.ogc.filter.DWithin,
    'must be within filter');

  var context = objectStack[objectStack.length - 1];
  goog.asserts.assert(goog.isObject(context), 'context should be an Object');
  context.srsName = filter.srsName;

  var item = ol.object.assign({}, context);
  item.node = node;
  ol.xml.pushSerializeAndPop(item,
    ol.format.WFS2.FILTER_SERIALIZERS,
    ol.xml.makeSimpleNodeFactory('ValueReference'), [filter.valueReference],
    objectStack);

  ol.format.GML3.prototype.writeGeometryElement(node, filter.geometry, objectStack);

  ol.xml.pushSerializeAndPop(item,
    ol.format.WFS2.FILTER_SERIALIZERS,
    ol.xml.makeSimpleNodeFactory('Distance'), [{distance : filter.distance, unit : filter.unit}],
    objectStack);
};

/**
 * @param {Node} node Node to append a TextNode with the decimal to.
 * @param {Object} object .
 */
ol.format.WFS2.writeDistance_ = function(node, object) {
  node.setAttribute('uom', object.unit);
  var distanceNode = ol.xml.DOCUMENT.createTextNode(object.distance);
  node.appendChild(distanceNode);
};

/**
 * @param {Node} node Node.
 * @param {ol.format.ogc.filter.Filter} filter Filter.
 * @param {Array.<*>} objectStack Node stack.
 * @private
 */
ol.format.WFS2.writeIntersectsFilter_ = function(node, filter, objectStack) {
  goog.asserts.assertInstanceof(filter, ol.format.ogc.filter.Intersects,
    'must be intersects filter');

  var context = objectStack[objectStack.length - 1];
  goog.asserts.assert(goog.isObject(context), 'context should be an Object');
  context.srsName = filter.srsName;

  var item = ol.object.assign({}, context);
  item.node = node;
  ol.xml.pushSerializeAndPop(item,
    ol.format.WFS2.FILTER_SERIALIZERS,
    ol.xml.makeSimpleNodeFactory('ValueReference'), [filter.valueReference],
    objectStack);

  ol.format.GML3.prototype.writeGeometryElement(node, filter.geometry, objectStack);

  ol.xml.pushSerializeAndPop(item,
    ol.format.WFS2.FILTER_SERIALIZERS,
    ol.xml.makeSimpleNodeFactory('Distance'), [filter.distance],
    objectStack);
};

/**
 * @param {Node} node Node.
 * @param {ol.format.ogc.filter.Filter} filter Filter.
 * @param {Array.<*>} objectStack Node stack.
 * @private
 */
ol.format.WFS2.writeFilterCondition_ = function (node, filter, objectStack) {
  var item = {node: node};
  ol.xml.pushSerializeAndPop(item,
    ol.format.WFS2.GETFEATURE_SERIALIZERS_,
    ol.xml.makeSimpleNodeFactory(filter.getTagName()),
    [filter], objectStack);
};

/**
 * @param {Node} node Node.
 * @param {ol.format.ogc.filter.Filter} filter Filter.
 * @param {Array.<*>} objectStack Node stack.
 * @private
 */
ol.format.WFS2.writeComparisonFilter_ = function(node, filter, objectStack) {
  goog.asserts.assertInstanceof(filter, ol.format.ogc.filter.ComparisonBinary,
    'must be binary comparison filter');
  if (filter.matchCase !== undefined) {
    node.setAttribute('matchCase', filter.matchCase.toString());
  }

  var context = objectStack[objectStack.length - 1];
  goog.asserts.assert(goog.isObject(context), 'context should be an Object');
  var item = ol.object.assign({}, context);
  item.node = node;

  ol.xml.pushSerializeAndPop(item,
    ol.format.WFS2.FILTER_SERIALIZERS,
    ol.xml.makeSimpleNodeFactory('ValueReference'), [filter.propertyName],
    objectStack);

  ol.xml.pushSerializeAndPop(item,
    ol.format.WFS2.FILTER_SERIALIZERS,
    ol.xml.makeSimpleNodeFactory('Literal'), [filter.expression],
    objectStack);
};

/**
 * @param {Node} node Node.
 * @param {ol.format.ogc.filter.Filter} filter Filter.
 * @param {Array.<*>} objectStack Node stack.
 * @private
 */
ol.format.WFS2.writeIsBetweenFilter_ = function(node, filter, objectStack) {
  goog.asserts.assertInstanceof(filter, ol.format.ogc.filter.IsBetween,
    'must be IsBetween comparison filter');

  if (filter.matchCase !== undefined) {
    node.setAttribute('matchCase', filter.matchCase.toString());
  }

  var context = objectStack[objectStack.length - 1];
  goog.asserts.assert(goog.isObject(context), 'context should be an Object');
  var item = ol.object.assign({}, context);
  item.node = node;

  ol.xml.pushSerializeAndPop(item,
    ol.format.WFS2.FILTER_SERIALIZERS,
    ol.xml.makeSimpleNodeFactory('ValueReference'), [filter.propertyName],
    objectStack);

  ol.xml.pushSerializeAndPop(item,
    ol.format.WFS2.FILTER_SERIALIZERS,
    ol.xml.makeSimpleNodeFactory('LowerBoundary'), [filter.lowerBoundary],
    objectStack);

  ol.xml.pushSerializeAndPop(item,
    ol.format.WFS2.FILTER_SERIALIZERS,
    ol.xml.makeSimpleNodeFactory('UpperBoundary'), [filter.upperBoundary],
    objectStack);

};

/**
 * @param {Node} node Node.
 * @param {string} boundary boundaryValue.
 * @param {Array.<*>} objectStack Node stack.
 * @private
 */
ol.format.WFS2.writeBoundary_ = function (node, boundary, objectStack) {
  var context = objectStack[objectStack.length - 1];
  goog.asserts.assert(goog.isObject(context), 'context should be an Object');
  var item = ol.object.assign({}, context);
  item.node = node;

  ol.xml.pushSerializeAndPop(item,
    ol.format.WFS2.FILTER_SERIALIZERS,
    ol.xml.makeSimpleNodeFactory('Literal'), [boundary],
    objectStack);
};

/**
 * @param {Node} node Node.
 * @param {ol.format.ogc.filter.Filter} filter Filter.
 * @param {Array.<*>} objectStack Node stack.
 * @private
 */
ol.format.WFS2.writeIsLikeFilter_ = function(node, filter, objectStack) {
  goog.asserts.assertInstanceof(filter, ol.format.ogc.filter.IsLike,
    'must be IsLike comparison filter');

  node.setAttribute('wildCard', filter.wildCard);
  node.setAttribute('singleChar', filter.singleChar);
  node.setAttribute('escapeChar', filter.escapeChar);
  if (filter.matchCase !== undefined) {
    node.setAttribute('matchCase', filter.matchCase.toString());
  }

  var context = objectStack[objectStack.length - 1];
  goog.asserts.assert(goog.isObject(context), 'context should be an Object');
  var item = ol.object.assign({}, context);
  item.node = node;

  ol.xml.pushSerializeAndPop(item,
    ol.format.WFS2.FILTER_SERIALIZERS,
    ol.xml.makeSimpleNodeFactory('ValueReference'), [filter.propertyName],
    objectStack);

  ol.xml.pushSerializeAndPop(item,
    ol.format.WFS2.FILTER_SERIALIZERS,
    ol.xml.makeSimpleNodeFactory('Literal'), [filter.pattern],
    objectStack);
};

/**
 * @param {Node} node Node.
 * @param {ol.format.ogc.filter.Filter} filter Filter.
 * @param {Array.<*>} objectStack Node stack.
 * @private
 */
ol.format.WFS2.writeLogicalFilter_ = function(node, filter, objectStack) {
  goog.asserts.assertInstanceof(filter, ol.format.ogc.filter.LogicalBinary,
    'must be logical filter');
  var item = {node: node};
  var conditionA = filter.conditionA;
  ol.xml.pushSerializeAndPop(item,
    ol.format.WFS2.GETFEATURE_SERIALIZERS_,
    ol.xml.makeSimpleNodeFactory(conditionA.getTagName()),
    [conditionA], objectStack);
  var conditionB = filter.conditionB;
  ol.xml.pushSerializeAndPop(item,
    ol.format.WFS2.GETFEATURE_SERIALIZERS_,
    ol.xml.makeSimpleNodeFactory(conditionB.getTagName()),
    [conditionB], objectStack);
};

/**
 * @type {Object.<string, Object.<string, ol.XmlSerializer>>}
 * @private
 */
ol.format.WFS2.GETFEATURE_SERIALIZERS_ = {
  'http://www.opengis.net/wfs/2.0': {
    'Query': ol.xml.makeChildAppender(ol.format.WFS2.writeQuery_)
  },
  'http://www.opengis.net/fes/2.0': {
    'And': ol.xml.makeChildAppender(ol.format.WFS2.writeLogicalFilter_),
    'BBOX': ol.xml.makeChildAppender(ol.format.WFS2.writeBboxFilter_),
    'Within' : ol.xml.makeChildAppender(ol.format.WFS2.writeWithinFilter_),
    'DWithin' : ol.xml.makeChildAppender(ol.format.WFS2.writeDWithinFilter_),
    'Intersects' : ol.xml.makeChildAppender(ol.format.WFS2.writeIntersectsFilter_),
    'PropertyIsEqualTo': ol.xml.makeChildAppender(ol.format.WFS2.writeComparisonFilter_),
    'PropertyIsNotEqualTo': ol.xml.makeChildAppender(ol.format.WFS2.writeComparisonFilter_),
    'PropertyIsLessThan': ol.xml.makeChildAppender(ol.format.WFS2.writeComparisonFilter_),
    'PropertyIsLessThanOrEqualTo': ol.xml.makeChildAppender(ol.format.WFS2.writeComparisonFilter_),
    'PropertyIsGreaterThan': ol.xml.makeChildAppender(ol.format.WFS2.writeComparisonFilter_),
    'PropertyIsGreaterThanOrEqualTo': ol.xml.makeChildAppender(ol.format.WFS2.writeComparisonFilter_),
    'PropertyIsBetween': ol.xml.makeChildAppender(ol.format.WFS2.writeIsBetweenFilter_),
    'PropertyIsLike': ol.xml.makeChildAppender(ol.format.WFS2.writeIsLikeFilter_)
  }
};

/**
 * @type {Object.<string, Object.<string, ol.XmlSerializer>>}
 * @private
 */
ol.format.WFS2.FILTER_SERIALIZERS = {
  'http://www.opengis.net/fes/2.0': {
    "ValueReference" : ol.xml.makeChildAppender(ol.format.XSD.writeStringTextNode),
    "Distance" : ol.xml.makeChildAppender(ol.format.WFS2.writeDistance_),
    "Literal" : ol.xml.makeChildAppender(ol.format.XSD.writeStringTextNode),
    "LowerBoundary" : ol.xml.makeChildAppender(ol.format.WFS2.writeBoundary_),
    "UpperBoundary" : ol.xml.makeChildAppender(ol.format.WFS2.writeBoundary_),
  }
};


/**
 * @type {Object.<string, Object.<string, ol.XmlSerializer>>}
 * @private
 */
ol.format.WFS2.QUERY_SERIALIZERS_ = {
  'http://www.opengis.net/wfs/2.0': {
    'PropertyName': ol.xml.makeChildAppender(ol.format.XSD.writeStringTextNode)
  }
};

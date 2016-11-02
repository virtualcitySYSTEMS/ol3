goog.provide('ol.format.WFS2');

goog.require('ol');
goog.require('ol.asserts');
goog.require('ol.format.GML3');
goog.require('ol.format.GMLBase');
goog.require('ol.format.filter');
goog.require('ol.format.XMLFeature');
goog.require('ol.format.XSD');
goog.require('ol.geom.Geometry');
goog.require('ol.obj');
goog.require('ol.proj');
goog.require('ol.xml');
goog.require('ol.format.CityGML');


/**
 * @classdesc
 * Feature format for reading and writing data in the WFS2.0 Format.
 * Currently only reads in CityGML2.0 and only parses a getFeature response
 *
 * @constructor
 * @param {olx.format.WFSOptions=} opt_options
 *     Optional configuration object.
 * @extends {ol.format.XMLFeature}
 * @api stable
 */
ol.format.WFS2 = function(opt_options) {
  var options = opt_options ? opt_options : {};

  /**
   * @private
   * @type {Array.<string>|string|undefined}
   */
  this.featureType_ = options.featureType;

  /**
   * @private
   * @type {Object.<string, string>|string|undefined}
   */
  this.featureNS_ = options.featureNS;

  /**
   * @private
   * @type {ol.format.GMLBase}
   */
  this.gmlFormat_ = options.gmlFormat ?
      options.gmlFormat : new ol.format.GML3();

  /**
   * @private
   * @type {ol.format.GMLBase}
   */
  this.citygmlFormat_ = options.gmlFormat ?
    options.citygmlFormat : new ol.format.CityGML();

  /**
   * @private
   * @type {string}
   */
  this.schemaLocation_ = options.schemaLocation ?
      options.schemaLocation : ol.format.WFS2.SCHEMA_LOCATION;

  ol.format.XMLFeature.call(this);
};
ol.inherits(ol.format.WFS2, ol.format.XMLFeature);


/**
 * @const
 * @type {string}
 */
ol.format.WFS2.FEATURE_PREFIX = 'feature';


/**
 * @const
 * @type {string}
 */
ol.format.WFS2.XMLNS = 'http://www.w3.org/2000/xmlns/';


/**
 * @const
 * @type {string}
 */
ol.format.WFS2.OGCNS = 'http://www.opengis.net/fes/2.0';


/**
 * @const
 * @type {string}
 */
ol.format.WFS2.WFSNS = 'http://www.opengis.net/wfs/2.0';


/**
 * @const
 * @type {string}
 */
ol.format.WFS2.SCHEMA_LOCATION = ol.format.WFS2.WFSNS +
    ' http://schemas.opengis.net/wfs/2.0/wfs.xsd';


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
ol.format.WFS2.prototype.readFeaturesFromNode = function(node, opt_options) {
  var context = /** @type {ol.XmlNodeStackItem} */ ({
    'featureType': this.featureType_,
    'featureNS': this.featureNS_
  });
  ol.obj.assign(context, this.getReadOptions(node,
      opt_options ? opt_options : {}));
  var objectStack = [context];
  this.gmlFormat_.FEATURE_COLLECTION_PARSERS[ol.format.GMLBase.GMLNS][
      'member'] =
      ol.xml.makeArrayPusher(ol.format.GMLBase.prototype.readFeaturesInternal);
  var features = ol.xml.pushParseAndPop([],
      this.gmlFormat_.FEATURE_COLLECTION_PARSERS, node,
      objectStack, this.citygmlFormat_);
  if (!features) {
    features = [];
  }
  return features;
};


/**
 * Read transaction response of the source.
 *
 * @param {Document|Node|Object|string} source Source.
 * @return {ol.WFSTransactionResponse|undefined} Transaction response.
 * @api stable
 */
ol.format.WFS2.prototype.readTransactionResponse = function(source) {
  if (ol.xml.isDocument(source)) {
    return this.readTransactionResponseFromDocument(
        /** @type {Document} */ (source));
  } else if (ol.xml.isNode(source)) {
    return this.readTransactionResponseFromNode(/** @type {Node} */ (source));
  } else if (typeof source === 'string') {
    var doc = ol.xml.parse(source);
    return this.readTransactionResponseFromDocument(doc);
  } else {
    return undefined;
  }
};


/**
 * Read feature collection metadata of the source.
 *
 * @param {Document|Node|Object|string} source Source.
 * @return {ol.WFSFeatureCollectionMetadata|undefined}
 *     FeatureCollection metadata.
 * @api stable
 */
ol.format.WFS2.prototype.readFeatureCollectionMetadata = function(source) {
  if (ol.xml.isDocument(source)) {
    return this.readFeatureCollectionMetadataFromDocument(
        /** @type {Document} */ (source));
  } else if (ol.xml.isNode(source)) {
    return this.readFeatureCollectionMetadataFromNode(
        /** @type {Node} */ (source));
  } else if (typeof source === 'string') {
    var doc = ol.xml.parse(source);
    return this.readFeatureCollectionMetadataFromDocument(doc);
  } else {
    return undefined;
  }
};


/**
 * @param {Document} doc Document.
 * @return {ol.WFSFeatureCollectionMetadata|undefined}
 *     FeatureCollection metadata.
 */
ol.format.WFS2.prototype.readFeatureCollectionMetadataFromDocument = function(doc) {
  ol.DEBUG && console.assert(doc.nodeType == Node.DOCUMENT_NODE,
      'doc.nodeType should be DOCUMENT');
  for (var n = doc.firstChild; n; n = n.nextSibling) {
    if (n.nodeType == Node.ELEMENT_NODE) {
      return this.readFeatureCollectionMetadataFromNode(n);
    }
  }
  return undefined;
};


/**
 * @const
 * @type {Object.<string, Object.<string, ol.XmlParser>>}
 * @private
 */
ol.format.WFS2.FEATURE_COLLECTION_PARSERS_ = {
  'http://www.opengis.net/gml': {
    'boundedBy': ol.xml.makeObjectPropertySetter(
        ol.format.GMLBase.prototype.readGeometryElement, 'bounds')
  }
};


/**
 * @param {Node} node Node.
 * @return {ol.WFSFeatureCollectionMetadata|undefined}
 *     FeatureCollection metadata.
 */
ol.format.WFS2.prototype.readFeatureCollectionMetadataFromNode = function(node) {
  ol.DEBUG && console.assert(node.nodeType == Node.ELEMENT_NODE,
      'node.nodeType should be ELEMENT');
  ol.DEBUG && console.assert(node.localName == 'FeatureCollection',
      'localName should be FeatureCollection');
  var result = {};
  var value = ol.format.XSD.readNonNegativeIntegerString(
      node.getAttribute('numberOfFeatures'));
  result['numberOfFeatures'] = value;
  return ol.xml.pushParseAndPop(
      /** @type {ol.WFSFeatureCollectionMetadata} */ (result),
      ol.format.WFS2.FEATURE_COLLECTION_PARSERS_, node, [], this.gmlFormat_);
};


/**
 * @const
 * @type {Object.<string, Object.<string, ol.XmlParser>>}
 * @private
 */
ol.format.WFS2.TRANSACTION_SUMMARY_PARSERS_ = {
  'http://www.opengis.net/wfs': {
    'totalInserted': ol.xml.makeObjectPropertySetter(
        ol.format.XSD.readNonNegativeInteger),
    'totalUpdated': ol.xml.makeObjectPropertySetter(
        ol.format.XSD.readNonNegativeInteger),
    'totalDeleted': ol.xml.makeObjectPropertySetter(
        ol.format.XSD.readNonNegativeInteger)
  }
};


/**
 * @param {Node} node Node.
 * @param {Array.<*>} objectStack Object stack.
 * @return {Object|undefined} Transaction Summary.
 * @private
 */
ol.format.WFS2.readTransactionSummary_ = function(node, objectStack) {
  return ol.xml.pushParseAndPop(
      {}, ol.format.WFS2.TRANSACTION_SUMMARY_PARSERS_, node, objectStack);
};


/**
 * @const
 * @type {Object.<string, Object.<string, ol.XmlParser>>}
 * @private
 */
ol.format.WFS2.OGC_FID_PARSERS_ = {
  'http://www.opengis.net/ogc': {
    'FeatureId': ol.xml.makeArrayPusher(function(node, objectStack) {
      return node.getAttribute('fid');
    })
  }
};


/**
 * @param {Node} node Node.
 * @param {Array.<*>} objectStack Object stack.
 * @private
 */
ol.format.WFS2.fidParser_ = function(node, objectStack) {
  ol.xml.parseNode(ol.format.WFS2.OGC_FID_PARSERS_, node, objectStack);
};


/**
 * @const
 * @type {Object.<string, Object.<string, ol.XmlParser>>}
 * @private
 */
ol.format.WFS2.INSERT_RESULTS_PARSERS_ = {
  'http://www.opengis.net/wfs': {
    'Feature': ol.format.WFS2.fidParser_
  }
};


/**
 * @param {Node} node Node.
 * @param {Array.<*>} objectStack Object stack.
 * @return {Array.<string>|undefined} Insert results.
 * @private
 */
ol.format.WFS2.readInsertResults_ = function(node, objectStack) {
  return ol.xml.pushParseAndPop(
      [], ol.format.WFS2.INSERT_RESULTS_PARSERS_, node, objectStack);
};


/**
 * @const
 * @type {Object.<string, Object.<string, ol.XmlParser>>}
 * @private
 */
ol.format.WFS2.TRANSACTION_RESPONSE_PARSERS_ = {
  'http://www.opengis.net/wfs': {
    'TransactionSummary': ol.xml.makeObjectPropertySetter(
        ol.format.WFS2.readTransactionSummary_, 'transactionSummary'),
    'InsertResults': ol.xml.makeObjectPropertySetter(
        ol.format.WFS2.readInsertResults_, 'insertIds')
  }
};


/**
 * @param {Document} doc Document.
 * @return {ol.WFSTransactionResponse|undefined} Transaction response.
 */
ol.format.WFS2.prototype.readTransactionResponseFromDocument = function(doc) {
  ol.DEBUG && console.assert(doc.nodeType == Node.DOCUMENT_NODE,
      'doc.nodeType should be DOCUMENT');
  for (var n = doc.firstChild; n; n = n.nextSibling) {
    if (n.nodeType == Node.ELEMENT_NODE) {
      return this.readTransactionResponseFromNode(n);
    }
  }
  return undefined;
};


/**
 * @param {Node} node Node.
 * @return {ol.WFSTransactionResponse|undefined} Transaction response.
 */
ol.format.WFS2.prototype.readTransactionResponseFromNode = function(node) {
  ol.DEBUG && console.assert(node.nodeType == Node.ELEMENT_NODE,
      'node.nodeType should  be ELEMENT');
  ol.DEBUG && console.assert(node.localName == 'TransactionResponse',
      'localName should be TransactionResponse');
  return ol.xml.pushParseAndPop(
      /** @type {ol.WFSTransactionResponse} */({}),
      ol.format.WFS2.TRANSACTION_RESPONSE_PARSERS_, node, []);
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


/**
 * @param {Node} node Node.
 * @param {ol.Feature} feature Feature.
 * @param {Array.<*>} objectStack Node stack.
 * @private
 */
ol.format.WFS2.writeFeature_ = function(node, feature, objectStack) {
  var context = objectStack[objectStack.length - 1];
  var featureType = context['featureType'];
  var featureNS = context['featureNS'];
  var child = ol.xml.createElementNS(featureNS, featureType);
  node.appendChild(child);
  ol.format.GML3.prototype.writeFeatureElement(child, feature, objectStack);
};


/**
 * @param {Node} node Node.
 * @param {number|string} fid Feature identifier.
 * @param {Array.<*>} objectStack Node stack.
 * @private
 */
ol.format.WFS2.writeOgcFidFilter_ = function(node, fid, objectStack) {
  var filter = ol.xml.createElementNS(ol.format.WFS2.OGCNS, 'Filter');
  var child = ol.xml.createElementNS(ol.format.WFS2.OGCNS, 'FeatureId');
  filter.appendChild(child);
  child.setAttribute('fid', fid);
  node.appendChild(filter);
};


/**
 * @param {Node} node Node.
 * @param {ol.Feature} feature Feature.
 * @param {Array.<*>} objectStack Node stack.
 * @private
 */
ol.format.WFS2.writeDelete_ = function(node, feature, objectStack) {
  var context = objectStack[objectStack.length - 1];
  ol.asserts.assert(feature.getId() !== undefined, 26); // Features must have an id set
  var featureType = context['featureType'];
  var featurePrefix = context['featurePrefix'];
  featurePrefix = featurePrefix ? featurePrefix :
      ol.format.WFS2.FEATURE_PREFIX;
  var featureNS = context['featureNS'];
  node.setAttribute('typeName', featurePrefix + ':' + featureType);
  ol.xml.setAttributeNS(node, ol.format.WFS2.XMLNS, 'xmlns:' + featurePrefix,
      featureNS);
  var fid = feature.getId();
  if (fid !== undefined) {
    ol.format.WFS2.writeOgcFidFilter_(node, fid, objectStack);
  }
};


/**
 * @param {Node} node Node.
 * @param {ol.Feature} feature Feature.
 * @param {Array.<*>} objectStack Node stack.
 * @private
 */
ol.format.WFS2.writeUpdate_ = function(node, feature, objectStack) {
  var context = objectStack[objectStack.length - 1];
  ol.asserts.assert(feature.getId() !== undefined, 27); // Features must have an id set
  var featureType = context['featureType'];
  var featurePrefix = context['featurePrefix'];
  featurePrefix = featurePrefix ? featurePrefix :
      ol.format.WFS2.FEATURE_PREFIX;
  var featureNS = context['featureNS'];
  node.setAttribute('typeName', featurePrefix + ':' + featureType);
  ol.xml.setAttributeNS(node, ol.format.WFS2.XMLNS, 'xmlns:' + featurePrefix,
      featureNS);
  var fid = feature.getId();
  if (fid !== undefined) {
    var keys = feature.getKeys();
    var values = [];
    for (var i = 0, ii = keys.length; i < ii; i++) {
      var value = feature.get(keys[i]);
      if (value !== undefined) {
        values.push({name: keys[i], value: value});
      }
    }
    ol.xml.pushSerializeAndPop(/** @type {ol.XmlNodeStackItem} */ (
        {node: node, 'srsName': context['srsName']}),
        ol.format.WFS2.TRANSACTION_SERIALIZERS_,
        ol.xml.makeSimpleNodeFactory('Property'), values,
        objectStack);
    ol.format.WFS2.writeOgcFidFilter_(node, fid, objectStack);
  }
};


/**
 * @param {Node} node Node.
 * @param {Object} pair Property name and value.
 * @param {Array.<*>} objectStack Node stack.
 * @private
 */
ol.format.WFS2.writeProperty_ = function(node, pair, objectStack) {
  var name = ol.xml.createElementNS(ol.format.WFS2.WFSNS, 'Name');
  node.appendChild(name);
  ol.format.XSD.writeStringTextNode(name, pair.name);
  if (pair.value !== undefined && pair.value !== null) {
    var value = ol.xml.createElementNS(ol.format.WFS2.WFSNS, 'Value');
    node.appendChild(value);
    if (pair.value instanceof ol.geom.Geometry) {
      ol.format.GML3.prototype.writeGeometryElement(value,
          pair.value, objectStack);
    } else {
      ol.format.XSD.writeStringTextNode(value, pair.value);
    }
  }
};


/**
 * @param {Node} node Node.
 * @param {{vendorId: string, safeToIgnore: boolean, value: string}}
 *     nativeElement The native element.
 * @param {Array.<*>} objectStack Node stack.
 * @private
 */
ol.format.WFS2.writeNative_ = function(node, nativeElement, objectStack) {
  if (nativeElement.vendorId) {
    node.setAttribute('vendorId', nativeElement.vendorId);
  }
  if (nativeElement.safeToIgnore !== undefined) {
    node.setAttribute('safeToIgnore', nativeElement.safeToIgnore);
  }
  if (nativeElement.value !== undefined) {
    ol.format.XSD.writeStringTextNode(node, nativeElement.value);
  }
};


/**
 * @type {Object.<string, Object.<string, ol.XmlSerializer>>}
 * @private
 */
ol.format.WFS2.TRANSACTION_SERIALIZERS_ = {
  'http://www.opengis.net/wfs/2.0': {
    'Insert': ol.xml.makeChildAppender(ol.format.WFS2.writeFeature_),
    'Update': ol.xml.makeChildAppender(ol.format.WFS2.writeUpdate_),
    'Delete': ol.xml.makeChildAppender(ol.format.WFS2.writeDelete_),
    'Property': ol.xml.makeChildAppender(ol.format.WFS2.writeProperty_),
    'Native': ol.xml.makeChildAppender(ol.format.WFS2.writeNative_)
  }
};


/**
 * @param {Node} node Node.
 * @param {string} featureType Feature type.
 * @param {Array.<*>} objectStack Node stack.
 * @private
 */
ol.format.WFS2.writeQuery_ = function(node, featureType, objectStack) {
  var context = /** @type {Object} */ (objectStack[objectStack.length - 1]);
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
  var item = /** @type {ol.XmlNodeStackItem} */ (ol.obj.assign({}, context));
  item.node = node;
  ol.xml.pushSerializeAndPop(item,
      ol.format.WFS2.QUERY_SERIALIZERS_,
      ol.xml.makeSimpleNodeFactory('PropertyName'), propertyNames,
      objectStack);
  var filter = context['filter'];
  if (filter) {
    var child = ol.xml.createElementNS(ol.format.WFS2.OGCNS, 'Filter');
    node.appendChild(child);
    ol.format.WFS2.writeFilterCondition_(child, filter, objectStack);
  }
};


/**
 * @param {Node} node Node.
 * @param {ol.format.filter.Filter} filter Filter.
 * @param {Array.<*>} objectStack Node stack.
 * @private
 */
ol.format.WFS2.writeFilterCondition_ = function(node, filter, objectStack) {
  /** @type {ol.XmlNodeStackItem} */
  var item = {node: node};
  ol.xml.pushSerializeAndPop(item,
      ol.format.WFS2.GETFEATURE_SERIALIZERS_,
      ol.xml.makeSimpleNodeFactory(filter.getTagName()),
      [filter], objectStack);
};


/**
 * @param {Node} node Node.
 * @param {ol.format.filter.Bbox} filter Filter.
 * @param {Array.<*>} objectStack Node stack.
 * @private
 */
ol.format.WFS2.writeBboxFilter_ = function(node, filter, objectStack) {
  var context = objectStack[objectStack.length - 1];
  context['srsName'] = filter.srsName;

  ol.format.WFS2.writeOgcPropertyName_(node, filter.geometryName);
  ol.format.GML3.prototype.writeGeometryElement(node, filter.extent, objectStack);
};


/**
 * @param {Node} node Node.
 * @param {ol.format.filter.Intersects} filter Filter.
 * @param {Array.<*>} objectStack Node stack.
 * @private
 */
ol.format.WFS2.writeIntersectsFilter_ = function(node, filter, objectStack) {
  var context = objectStack[objectStack.length - 1];
  context['srsName'] = filter.srsName;

  ol.format.WFS2.writeOgcPropertyName_(node, filter.geometryName);
  ol.format.GML3.prototype.writeGeometryElement(node, filter.geometry, objectStack);
};


/**
 * @param {Node} node Node.
 * @param {ol.format.filter.Within} filter Filter.
 * @param {Array.<*>} objectStack Node stack.
 * @private
 */
ol.format.WFS2.writeWithinFilter_ = function(node, filter, objectStack) {
  var context = objectStack[objectStack.length - 1];
  context['srsName'] = filter.srsName;

  ol.format.WFS2.writeOgcPropertyName_(node, filter.geometryName);
  ol.format.GML3.prototype.writeGeometryElement(node, filter.geometry, objectStack);
};

/**
 * @param {Node} node Node.
 * @param {ol.format.filter.DWithin} filter Filter.
 * @param {Array.<*>} objectStack Node stack.
 * @private
 */
ol.format.WFS2.writeDWithinFilter_ = function(node, filter, objectStack) {
  var context = objectStack[objectStack.length - 1];
  context['srsName'] = filter.srsName;
  ol.format.WFS2.writeOgcPropertyName_(node, filter.geometryName);
  ol.format.GML3.prototype.writeGeometryElement(node, filter.geometry, objectStack);

  var distance = ol.xml.createElementNS(ol.format.WFS2.OGCNS, 'Distance');
  ol.format.XSD.writeStringTextNode(distance, filter.distance);
  distance.setAttribute('uom', filter.unit);
  node.appendChild(distance);
};


/**
 * @param {Node} node Node.
 * @param {ol.format.filter.LogicalBinary} filter Filter.
 * @param {Array.<*>} objectStack Node stack.
 * @private
 */
ol.format.WFS2.writeLogicalFilter_ = function(node, filter, objectStack) {
  /** @type {ol.XmlNodeStackItem} */
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
 * @param {Node} node Node.
 * @param {ol.format.filter.Not} filter Filter.
 * @param {Array.<*>} objectStack Node stack.
 * @private
 */
ol.format.WFS2.writeNotFilter_ = function(node, filter, objectStack) {
  /** @type {ol.XmlNodeStackItem} */
  var item = {node: node};
  var condition = filter.condition;
  ol.xml.pushSerializeAndPop(item,
      ol.format.WFS2.GETFEATURE_SERIALIZERS_,
      ol.xml.makeSimpleNodeFactory(condition.getTagName()),
      [condition], objectStack);
};


/**
 * @param {Node} node Node.
 * @param {ol.format.filter.ComparisonBinary} filter Filter.
 * @param {Array.<*>} objectStack Node stack.
 * @private
 */
ol.format.WFS2.writeComparisonFilter_ = function(node, filter, objectStack) {
  if (filter.matchCase !== undefined) {
    node.setAttribute('matchCase', filter.matchCase.toString());
  }
  ol.format.WFS2.writeOgcPropertyName_(node, filter.propertyName);
  ol.format.WFS2.writeOgcLiteral_(node, '' + filter.expression);
};


/**
 * @param {Node} node Node.
 * @param {ol.format.filter.IsNull} filter Filter.
 * @param {Array.<*>} objectStack Node stack.
 * @private
 */
ol.format.WFS2.writeIsNullFilter_ = function(node, filter, objectStack) {
  ol.format.WFS2.writeOgcPropertyName_(node, filter.propertyName);
};


/**
 * @param {Node} node Node.
 * @param {ol.format.filter.IsBetween} filter Filter.
 * @param {Array.<*>} objectStack Node stack.
 * @private
 */
ol.format.WFS2.writeIsBetweenFilter_ = function(node, filter, objectStack) {
  ol.format.WFS2.writeOgcPropertyName_(node, filter.propertyName);

  var lowerBoundary = ol.xml.createElementNS(ol.format.WFS2.OGCNS, 'LowerBoundary');
  node.appendChild(lowerBoundary);
  ol.format.WFS2.writeOgcLiteral_(lowerBoundary, '' + filter.lowerBoundary);

  var upperBoundary = ol.xml.createElementNS(ol.format.WFS2.OGCNS, 'UpperBoundary');
  node.appendChild(upperBoundary);
  ol.format.WFS2.writeOgcLiteral_(upperBoundary, '' + filter.upperBoundary);
};


/**
 * @param {Node} node Node.
 * @param {ol.format.filter.IsLike} filter Filter.
 * @param {Array.<*>} objectStack Node stack.
 * @private
 */
ol.format.WFS2.writeIsLikeFilter_ = function(node, filter, objectStack) {
  node.setAttribute('wildCard', filter.wildCard);
  node.setAttribute('singleChar', filter.singleChar);
  node.setAttribute('escapeChar', filter.escapeChar);
  if (filter.matchCase !== undefined) {
    node.setAttribute('matchCase', filter.matchCase.toString());
  }
  ol.format.WFS2.writeOgcPropertyName_(node, filter.propertyName);
  ol.format.WFS2.writeOgcLiteral_(node, '' + filter.pattern);
};


/**
 * @param {string} tagName Tag name.
 * @param {Node} node Node.
 * @param {string} value Value.
 * @private
 */
ol.format.WFS2.writeOgcExpression_ = function(tagName, node, value) {
  var property = ol.xml.createElementNS(ol.format.WFS2.OGCNS, tagName);
  ol.format.XSD.writeStringTextNode(property, value);
  node.appendChild(property);
};


/**
 * @param {Node} node Node.
 * @param {string} value PropertyName value.
 * @private
 */
ol.format.WFS2.writeOgcPropertyName_ = function(node, value) {
  ol.format.WFS2.writeOgcExpression_('ValueReference', node, value);
};


/**
 * @param {Node} node Node.
 * @param {string} value PropertyName value.
 * @private
 */
ol.format.WFS2.writeOgcLiteral_ = function(node, value) {
  ol.format.WFS2.writeOgcExpression_('Literal', node, value);
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
    'Or': ol.xml.makeChildAppender(ol.format.WFS2.writeLogicalFilter_),
    'Not': ol.xml.makeChildAppender(ol.format.WFS2.writeNotFilter_),
    'BBOX': ol.xml.makeChildAppender(ol.format.WFS2.writeBboxFilter_),
    'Intersects': ol.xml.makeChildAppender(ol.format.WFS2.writeIntersectsFilter_),
    'Within': ol.xml.makeChildAppender(ol.format.WFS2.writeWithinFilter_),
    'DWithin': ol.xml.makeChildAppender(ol.format.WFS2.writeDWithinFilter_),
    'PropertyIsEqualTo': ol.xml.makeChildAppender(ol.format.WFS2.writeComparisonFilter_),
    'PropertyIsNotEqualTo': ol.xml.makeChildAppender(ol.format.WFS2.writeComparisonFilter_),
    'PropertyIsLessThan': ol.xml.makeChildAppender(ol.format.WFS2.writeComparisonFilter_),
    'PropertyIsLessThanOrEqualTo': ol.xml.makeChildAppender(ol.format.WFS2.writeComparisonFilter_),
    'PropertyIsGreaterThan': ol.xml.makeChildAppender(ol.format.WFS2.writeComparisonFilter_),
    'PropertyIsGreaterThanOrEqualTo': ol.xml.makeChildAppender(ol.format.WFS2.writeComparisonFilter_),
    'PropertyIsNull': ol.xml.makeChildAppender(ol.format.WFS2.writeIsNullFilter_),
    'PropertyIsBetween': ol.xml.makeChildAppender(ol.format.WFS2.writeIsBetweenFilter_),
    'PropertyIsLike': ol.xml.makeChildAppender(ol.format.WFS2.writeIsLikeFilter_)
  }
};


/**
 * @param {Node} node Node.
 * @param {Array.<string>} featureTypes Feature types.
 * @param {Array.<*>} objectStack Node stack.
 * @private
 */
ol.format.WFS2.writeGetFeature_ = function(node, featureTypes, objectStack) {
  var context = /** @type {Object} */ (objectStack[objectStack.length - 1]);
  var item = /** @type {ol.XmlNodeStackItem} */ (ol.obj.assign({}, context));
  item.node = node;
  ol.xml.pushSerializeAndPop(item,
      ol.format.WFS2.GETFEATURE_SERIALIZERS_,
      ol.xml.makeSimpleNodeFactory('Query'), featureTypes,
      objectStack);
};


/**
 * Encode format as WFS `GetFeature` and return the Node.
 *
 * @param {olx.format.WFSWriteGetFeatureOptions} options Options.
 * @return {Node} Result.
 * @api stable
 */
ol.format.WFS2.prototype.writeGetFeature = function(options) {
  var node = ol.xml.createElementNS(ol.format.WFS2.WFSNS, 'GetFeature');
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
      ol.asserts.assert(options.geometryName,
          12); // `options.geometryName` must also be provided when `options.bbox` is set
      var bbox = ol.format.filter.bbox(
          /** @type {string} */ (options.geometryName), options.bbox, options.srsName);
      if (filter) {
        // if bbox and filter are both set, combine the two into a single filter
        filter = ol.format.filter.and(filter, bbox);
      } else {
        filter = bbox;
      }
    }
  }
  ol.xml.setAttributeNS(node, 'http://www.w3.org/2001/XMLSchema-instance',
      'xsi:schemaLocation', this.schemaLocation_);

  if(options.allNs){
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

  /** @type {ol.XmlNodeStackItem} */
  var context = {
    node: node,
    'srsName': options.srsName,
    'featureNS': options.featureNS ? options.featureNS : this.featureNS_,
    'featurePrefix': options.featurePrefix,
    'geometryName': options.geometryName,
    'filter': filter,
    'propertyNames': options.propertyNames ? options.propertyNames : []
  };
  ol.asserts.assert(Array.isArray(options.featureTypes),
      11); // `options.featureTypes` should be an Array
  ol.format.WFS2.writeGetFeature_(node, /** @type {!Array.<string>} */ (options.featureTypes), [context]);
  return node;
};


/**
 * Encode format as WFS `Transaction` and return the Node.
 *
 * @param {Array.<ol.Feature>} inserts The features to insert.
 * @param {Array.<ol.Feature>} updates The features to update.
 * @param {Array.<ol.Feature>} deletes The features to delete.
 * @param {olx.format.WFSWriteTransactionOptions} options Write options.
 * @return {Node} Result.
 * @api stable
 */
ol.format.WFS2.prototype.writeTransaction = function(inserts, updates, deletes,
    options) {
  var objectStack = [];
  var node = ol.xml.createElementNS(ol.format.WFS2.WFSNS, 'Transaction');
  node.setAttribute('service', 'WFS');
  node.setAttribute('version', '2.0.0');
  var baseObj;
  /** @type {ol.XmlNodeStackItem} */
  var obj;
  if (options) {
    baseObj = options.gmlOptions ? options.gmlOptions : {};
    if (options.handle) {
      node.setAttribute('handle', options.handle);
    }
  }
  ol.xml.setAttributeNS(node, 'http://www.w3.org/2001/XMLSchema-instance',
      'xsi:schemaLocation', this.schemaLocation_);
  if (inserts) {
    obj = {node: node, 'featureNS': options.featureNS,
      'featureType': options.featureType, 'featurePrefix': options.featurePrefix,
      'srsName': options.srsName};
    ol.obj.assign(obj, baseObj);
    ol.xml.pushSerializeAndPop(obj,
        ol.format.WFS2.TRANSACTION_SERIALIZERS_,
        ol.xml.makeSimpleNodeFactory('Insert'), inserts,
        objectStack);
  }
  if (updates) {
    obj = {node: node, 'featureNS': options.featureNS,
      'featureType': options.featureType, 'featurePrefix': options.featurePrefix,
      'srsName': options.srsName};
    ol.obj.assign(obj, baseObj);
    ol.xml.pushSerializeAndPop(obj,
        ol.format.WFS2.TRANSACTION_SERIALIZERS_,
        ol.xml.makeSimpleNodeFactory('Update'), updates,
        objectStack);
  }
  if (deletes) {
    ol.xml.pushSerializeAndPop({node: node, 'featureNS': options.featureNS,
      'featureType': options.featureType, 'featurePrefix': options.featurePrefix,
      'srsName': options.srsName},
    ol.format.WFS2.TRANSACTION_SERIALIZERS_,
    ol.xml.makeSimpleNodeFactory('Delete'), deletes,
    objectStack);
  }
  if (options.nativeElements) {
    ol.xml.pushSerializeAndPop({node: node, 'featureNS': options.featureNS,
      'featureType': options.featureType, 'featurePrefix': options.featurePrefix,
      'srsName': options.srsName},
    ol.format.WFS2.TRANSACTION_SERIALIZERS_,
    ol.xml.makeSimpleNodeFactory('Native'), options.nativeElements,
    objectStack);
  }
  return node;
};


/**
 * Read the projection from a WFS source.
 *
 * @function
 * @param {Document|Node|Object|string} source Source.
 * @return {?ol.proj.Projection} Projection.
 * @api stable
 */
ol.format.WFS2.prototype.readProjection;


/**
 * @inheritDoc
 */
ol.format.WFS2.prototype.readProjectionFromDocument = function(doc) {
  ol.DEBUG && console.assert(doc.nodeType == Node.DOCUMENT_NODE,
      'doc.nodeType should be a DOCUMENT');
  for (var n = doc.firstChild; n; n = n.nextSibling) {
    if (n.nodeType == Node.ELEMENT_NODE) {
      return this.readProjectionFromNode(n);
    }
  }
  return null;
};


/**
 * @inheritDoc
 */
ol.format.WFS2.prototype.readProjectionFromNode = function(node) {
  ol.DEBUG && console.assert(node.nodeType == Node.ELEMENT_NODE,
      'node.nodeType should be ELEMENT');
  ol.DEBUG && console.assert(node.localName == 'FeatureCollection',
      'localName should be FeatureCollection');

  if (node.firstElementChild &&
      node.firstElementChild.firstElementChild) {
    node = node.firstElementChild.firstElementChild;
    for (var n = node.firstElementChild; n; n = n.nextElementSibling) {
      if (!(n.childNodes.length === 0 ||
          (n.childNodes.length === 1 &&
          n.firstChild.nodeType === 3))) {
        var objectStack = [{}];
        this.gmlFormat_.readGeometryElement(n, objectStack);
        return ol.proj.get(objectStack.pop().srsName);
      }
    }
  }

  return null;
};

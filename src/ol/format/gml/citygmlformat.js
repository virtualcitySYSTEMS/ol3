goog.provide('ol.format.CityGML');

goog.require('goog.asserts');
goog.require('goog.dom.NodeType');
//goog.require('ol.format.Feature');
goog.require('ol.format.XMLFeature');
goog.require('ol.xml');


/**
 * @classdesc
 * CityGML class for parsing, currently only used in WFS2Format for reading wfs:GetFeature response
 * Not suitable for other use currently..
 *
 * @constructor
 * @param {olx.format.GMLOptions=} opt_options
 *     Optional configuration object.
 * @extends {ol.format.XMLFeature}
 */
ol.format.CityGML = function(opt_options) {
  var options = /** @type {olx.format.GMLOptions} */
      (opt_options ? opt_options : {});

  /**
   * @protected
   * @type {string}
   */
  this.schemaLocation_ = options.schemaLocation ? options.schemaLocation : ol.format.CityGML.SCHEMA_LOCATION;

  /*
  "http://www.opengis.net/citygml/waterbody/2.0" : null,
  "http://www.opengis.net/citygml/vegetation/2.0" : null,
  "http://www.opengis.net/citygml/relief/2.0" : null,
  "http://www.opengis.net/citygml/transportation/2.0" : null,
  "http://www.opengis.net/citygml/building/2.0" : null,
  "http://www.opengis.net/citygml/cityobjectgroup/2.0" : null,
  "http://www.opengis.net/citygml/tunnel/2.0" : null,
  "http://www.opengis.net/citygml/cityfurniture/2.0" : null,
  "http://www.opengis.net/citygml/bridge/2.0" : null,
  "http://www.opengis.net/citygml/landuse/2.0" : null
  */
  /**
   * @type {Object.<string, Object.<string, Object>>}
   */
  this.TOP_LEVEL_FEATURE_PARSERS = {
    "http://www.opengis.net/citygml/building/2.0" : {
      "Building" : ol.xml.makeReplacer(this.readBuildingFeature)
    }
  };

  this.BUILDING_PARSER_AS_FEATURE = {
    "http://www.opengis.net/citygml/2.0" : {
      "creationDate" : this.makeFeaturePropertySetter(this.readCreationDate, "creationDate")
    },
    "http://www.opengis.net/citygml/generics/2.0" : {
      "stringAttribute" : this.makeFeatureGenericCityGMLPropertySetter(this.readGenericStringAttribute),
      "intAttribute" : this.makeFeatureGenericCityGMLPropertySetter(this.readGenericIntAttribute)
    }
  };

  this.BUILDING_PARSER_AS_OBJECT = {
    "http://www.opengis.net/citygml/2.0" : {
      "creationDate" : this.makeObjectPropertySetterAsAttribute(this.readCreationDate, "creationDate")
    },
    "http://www.opengis.net/citygml/generics/2.0" : {
      "stringAttribute" : this.makeObjectGenericCityGMLPropertySetterAsAttribute(this.readGenericStringAttribute),
      "intAttribute" : this.makeObjectGenericCityGMLPropertySetterAsAttribute(this.readGenericIntAttribute)
    }
  };


  goog.base(this);
};
goog.inherits(ol.format.CityGML, ol.format.XMLFeature);


/**
 * @const
 * @type {Array.<string>}
 */
ol.format.CityGML.NS = [
    "http://www.opengis.net/citygml/waterbody/2.0",
    "http://www.3dcitydb.org/citygml-ade/3.0",
    "http://www.opengis.net/citygml/2.0",
    "http://www.opengis.net/citygml/vegetation/2.0",
    "http://www.opengis.net/citygml/relief/2.0",
    "http://www.opengis.net/citygml/transportation/2.0",
    "http://www.opengis.net/citygml/building/2.0",
    "http://www.opengis.net/citygml/cityobjectgroup/2.0",
    "http://www.opengis.net/citygml/tunnel/2.0",
    "http://www.opengis.net/citygml/cityfurniture/2.0",
    "http://www.opengis.net/citygml/generics/2.0",
    "http://www.opengis.net/citygml/bridge/2.0",
    "http://www.w3.org/1999/xlink",
    "http://www.opengis.net/citygml/landuse/2.0",
    "http://www.opengis.net/citygml/waterbody/2.0"
  ];

  ol.format.CityGML.SCHEMA_LOCATION = "http://schemas.opengis.net/citygml/waterbody/2.0/waterBody.xsd http://www.3dcitydb.org/citygml-ade/3.0 http://www.virtualcitysystems.de/3dcitydb/citygml-ade/3.0/3dcitydb-ade-citygml-2.0.xsd http://www.opengis.net/citygml/vegetation/2.0 http://schemas.opengis.net/citygml/vegetation/2.0/vegetation.xsd http://www.opengis.net/citygml/transportation/2.0 http://schemas.opengis.net/citygml/transportation/2.0/transportation.xsd http://www.opengis.net/citygml/relief/2.0 http://schemas.opengis.net/citygml/relief/2.0/relief.xsd http://www.opengis.net/citygml/building/2.0 http://schemas.opengis.net/citygml/building/2.0/building.xsd http://www.opengis.net/citygml/cityobjectgroup/2.0 http://schemas.opengis.net/citygml/cityobjectgroup/2.0/cityObjectGroup.xsd http://www.opengis.net/wfs/2.0 http://schemas.opengis.net/wfs/2.0/wfs.xsd http://www.opengis.net/citygml/tunnel/2.0 http://schemas.opengis.net/citygml/tunnel/2.0/tunnel.xsd http://www.opengis.net/citygml/cityfurniture/2.0 http://schemas.opengis.net/citygml/cityfurniture/2.0/cityFurniture.xsd http://www.opengis.net/citygml/generics/2.0 http://schemas.opengis.net/citygml/generics/2.0/generics.xsd http://www.opengis.net/citygml/bridge/2.0 http://schemas.opengis.net/citygml/bridge/2.0/bridge.xsd http://www.opengis.net/citygml/landuse/2.0 http://schemas.opengis.net/citygml/landuse/2.0/landUse.xsd";


ol.format.CityGML.prototype.readBuildingFeature = function(node, objectStack){
  goog.asserts.assert(node.nodeType == goog.dom.NodeType.ELEMENT,'node.nodeType should be ELEMENT');
  var object = {
    id : node.getAttribute("gml:id"),
    type : 26
  };
  object = ol.xml.pushParseAndPop(object, this.BUILDING_PARSER_AS_OBJECT, node, objectStack, this);
  return object;
  /*
  var feature = new ol.Feature();
  feature.setId(node.getAttribute("gml:id"));
  feature = ol.xml.pushParseAndPop(feature, this.BUILDING_PARSER, node, objectStack, this);
  return feature;
  */
};

ol.format.CityGML.prototype.readCreationDate = function(node, objectstack){
  return node.textContent.trim();
};

ol.format.CityGML.prototype.readGenericStringAttribute = function(node, objectStack){
  goog.asserts.assert(node.nodeType == goog.dom.NodeType.ELEMENT,'node.nodeType should be ELEMENT');
  var attributeName = node.getAttribute("name");
  var attributeValue = node.textContent.trim();
  var object = {};
  object[attributeName] = attributeValue;
  return object;
};

ol.format.CityGML.prototype.readGenericIntAttribute = function(node, objectStack){
  goog.asserts.assert(node.nodeType == goog.dom.NodeType.ELEMENT,'node.nodeType should be ELEMENT');
  var attributeName = node.getAttribute("name");
  var attributeValue = parseFloat(node.textContent.trim());
  var object = {};
  object[attributeName] = attributeValue;
  return object;
};

/**
 * Make an object property setter function and store the value under "attributes".
 * @param {function(this: T, Node, Array.<*>): *} valueReader Value reader.
 * @param {string=} opt_property Property.
 * @param {T=} opt_this The object to use as `this` in `valueReader`.
 * @return {ol.xml.Parser} Parser.
 * @template T
 */
ol.format.CityGML.prototype.makeObjectPropertySetterAsAttribute =
  function(valueReader, opt_property, opt_this) {
  goog.asserts.assert(valueReader !== undefined,'undefined valueReader, expected function(this: T, Node, Array.<*>)');
  return (
    /**
     * @param {Node} node Node.
     * @param {Array.<*>} objectStack Object stack.
     */
    function(node, objectStack) {
      var value = valueReader.call(opt_this !== undefined ? opt_this : this,node, objectStack);
      if (value !== undefined) {
        var object = /** @type {Object} */
            (objectStack[objectStack.length - 1]);
        var property = opt_property !== undefined ? opt_property : node.localName;
        goog.asserts.assert(goog.isObject(object),'entity from stack was not an object');
        if (!object.attributes){
          object.attributes = {};
        }
        object.attributes[property] = value;
      }
    });
};

/**
 * Make an (ol.feature) feature property setter function for generic CityGML attributes name attribute of node contains the name of the attribute
 * @param {function(this: T, Node, Array.<*>): Object<string,*>} valueReader Value reader.
 * @param {string=} opt_property Property.
 * @param {T=} opt_this The object to use as `this` in `valueReader`.
 * @return {ol.xml.Parser} Parser.
 * @template T
 */
ol.format.CityGML.prototype.makeObjectGenericCityGMLPropertySetterAsAttribute =
    function(valueReader, opt_property, opt_this) {
  goog.asserts.assert(valueReader !== undefined,'undefined valueReader, expected function(this: T, Node, Array.<*>)');
  return (
      /**
       * @param {Node} node Node.
       * @param {Array.<*>} objectStack Object stack.
       */
      function(node, objectStack) {
        /** @type {Object<string,*>} */
        var propertyObject = valueReader.call(opt_this !== undefined ? opt_this : this,node, objectStack);
        if (propertyObject !== undefined) {
          var object = /** @type {Object} */
              (objectStack[objectStack.length - 1]);
          for (var key in propertyObject){
            object.attributes[key] = propertyObject[key];
          }
        }
      });
};

/**
 * Make an (ol.feature) feature property setter function for generic CityGML attributes name attribute of node contains the name of the attribute
 * @param {function(this: T, Node, Array.<*>): Object<string,*>} valueReader Value reader.
 * @param {string=} opt_property Property.
 * @param {T=} opt_this The object to use as `this` in `valueReader`.
 * @return {ol.xml.Parser} Parser.
 * @template T
 */
ol.format.CityGML.prototype.makeFeatureGenericCityGMLPropertySetter =
    function(valueReader, opt_property, opt_this) {
  goog.asserts.assert(valueReader !== undefined,'undefined valueReader, expected function(this: T, Node, Array.<*>)');
  return (
      /**
       * @param {Node} node Node.
       * @param {Array.<*>} objectStack Object stack.
       */
      function(node, objectStack) {
        var propertyObject = valueReader.call(opt_this !== undefined ? opt_this : this,node, objectStack);
        if (propertyObject !== undefined) {
          var feature = /** @type {ol.Feature} */
              (objectStack[objectStack.length - 1]);
          goog.asserts.assert(feature instanceof ol.Feature,'entity from stack was not an object');
          feature.setProperties(propertyObject);
        }
      });
};

/**
 * Make an (ol.feature) feature property setter function
 * @param {function(this: T, Node, Array.<*>): *} valueReader Value reader.
 * @param {string=} opt_property Property.
 * @param {T=} opt_this The object to use as `this` in `valueReader`.
 * @return {ol.xml.Parser} Parser.
 * @template T
 */
ol.format.CityGML.prototype.makeFeaturePropertySetter =
    function(valueReader, opt_property, opt_this) {
  goog.asserts.assert(valueReader !== undefined,'undefined valueReader, expected function(this: T, Node, Array.<*>)');
  return (
      /**
       * @param {Node} node Node.
       * @param {Array.<*>} objectStack Object stack.
       */
      function(node, objectStack) {
        var value = valueReader.call(opt_this !== undefined ? opt_this : this,node, objectStack);
        if (value !== undefined) {
          var feature = /** @type {ol.Feature} */
              (objectStack[objectStack.length - 1]);
          goog.asserts.assert(feature instanceof ol.Feature,'entity from stack was not an object');
          var property = opt_property !== undefined ? opt_property : node.localName;
          var propertyObject = {};
          propertyObject[property] = value;
          feature.setProperties(propertyObject);
        }
      });
};

goog.provide('ol.format.CityGML');

goog.require('ol');
goog.require('ol.format.GML3');
goog.require('ol.xml');


/**
 * @classdesc
 * Feature format for reading in the CityGML format
 *
 * @constructor
 * @param {olx.format.GMLOptions=} opt_options
 *     Optional configuration object.
 * @extends {ol.format.GML3}
 * @api
 */
ol.format.CityGML = function(opt_options) {
  var options = /** @type {olx.format.GMLOptions} */
      (opt_options ? opt_options : {});

  ol.format.GML3.call(this, options);


  this.schemaLocation = options.schemaLocation ?
      options.schemaLocation : ol.format.CityGML.schemaLocation_;

  this.FEATURE_COLLECTION_PARSERS['http://www.opengis.net/citygml/building/2.0'] = {
    'GenericCityObject' : ol.xml.makeReplacer(this.readGenericCityObjectFeature),
    'Building' : ol.xml.makeReplacer(this.readBuildingFeature),
    'Bridge' : ol.xml.makeReplacer(this.readBridgeFeature),
    'Tunnel' : ol.xml.makeReplacer(this.readTunnelFeature),
    'CityFurniture' : ol.xml.makeReplacer(this.readCityFurnitureFeature),
    'CityObjectGroup' : ol.xml.makeReplacer(this.readCityObjectGroupFeature),
    'LandUse' : ol.xml.makeReplacer(this.readLandUseFeature),
    'TransportationComplex' : ol.xml.makeReplacer(this.readTransportationComplexFeature),
    'Railway' : ol.xml.makeReplacer(this.readRailwayFeature),
    'Road' : ol.xml.makeReplacer(this.readRoadFeature),
    'Track' : ol.xml.makeReplacer(this.readTrackFeature),
    'Square' : ol.xml.makeReplacer(this.readSquareFeature),
    'SolitaryVegetationObject' : ol.xml.makeReplacer(this.readSolitaryVegetationObjectFeature),
    'PlantCover' : ol.xml.makeReplacer(this.readPlantCoverFeature),
    'WaterBody' : ol.xml.makeReplacer(this.readWaterBodyFeature)
  }
};
ol.inherits(ol.format.CityGML, ol.format.GML3);



/**
 * @const
 * @type {string}
 * @private
 */
ol.format.CityGML.SCHEMA_LOCATION = 'http://schemas.opengis.net/citygml/waterbody/2.0/waterBody.xsd http://www.3dcitydb.org/citygml-ade/3.0 http://www.virtualcitysystems.de/3dcitydb/citygml-ade/3.0/3dcitydb-ade-citygml-2.0.xsd http://www.opengis.net/citygml/vegetation/2.0 http://schemas.opengis.net/citygml/vegetation/2.0/vegetation.xsd http://www.opengis.net/citygml/transportation/2.0 http://schemas.opengis.net/citygml/transportation/2.0/transportation.xsd http://www.opengis.net/citygml/relief/2.0 http://schemas.opengis.net/citygml/relief/2.0/relief.xsd http://www.opengis.net/citygml/building/2.0 http://schemas.opengis.net/citygml/building/2.0/building.xsd http://www.opengis.net/citygml/cityobjectgroup/2.0 http://schemas.opengis.net/citygml/cityobjectgroup/2.0/cityObjectGroup.xsd http://www.opengis.net/wfs/2.0 http://schemas.opengis.net/wfs/2.0/wfs.xsd http://www.opengis.net/citygml/tunnel/2.0 http://schemas.opengis.net/citygml/tunnel/2.0/tunnel.xsd http://www.opengis.net/citygml/cityfurniture/2.0 http://schemas.opengis.net/citygml/cityfurniture/2.0/cityFurniture.xsd http://www.opengis.net/citygml/generics/2.0 http://schemas.opengis.net/citygml/generics/2.0/generics.xsd http://www.opengis.net/citygml/bridge/2.0 http://schemas.opengis.net/citygml/bridge/2.0/bridge.xsd http://www.opengis.net/citygml/landuse/2.0 http://schemas.opengis.net/citygml/landuse/2.0/landUse.xsd';

ol.format.CityGML.prototype.readGenericCityObjectFeature = function(node, objectStack) {
  var object = {
    id : node.getAttribute('gml:id'),
    type : 5 ,
    children : []
  };
  object = ol.xml.pushParseAndPop(object, this.CITYOBJECT_PARSER, node, objectStack, this);
  return object;
};
ol.format.CityGML.prototype.readBuildingFeature = function(node, objectStack) {
  var object = {
    id : node.getAttribute('gml:id'),
    type : 26,
    children : []
  };
  object = ol.xml.pushParseAndPop(object, this.CITYOBJECT_PARSER, node, objectStack, this);
  return object;
};
ol.format.CityGML.prototype.readBridgeFeature = function(node, objectStack) {
  var object = {
    id : node.getAttribute('gml:id'),
    type : 64,
    children : []
  };
  object = ol.xml.pushParseAndPop(object, this.CITYOBJECT_PARSER, node, objectStack, this);
  return object;
};
ol.format.CityGML.prototype.readTunnelFeature = function(node, objectStack) {
  var object = {
    id : node.getAttribute('gml:id'),
    type : 85,
    children : []
  };
  object = ol.xml.pushParseAndPop(object, this.CITYOBJECT_PARSER, node, objectStack, this);
  return object;
};
ol.format.CityGML.prototype.readCityFurnitureFeature = function(node, objectStack) {
  var object = {
    id : node.getAttribute('gml:id'),
    type : 21 ,
    children : []
  };
  object = ol.xml.pushParseAndPop(object, this.CITYOBJECT_PARSER, node, objectStack, this);
  return object;
};
ol.format.CityGML.prototype.readCityObjectGroupFeature = function(node, objectStack) {
  var object = {
    id : node.getAttribute('gml:id'),
    type : 23,
    children : []
  };
  object = ol.xml.pushParseAndPop(object, this.CITYOBJECT_PARSER, node, objectStack, this);
  return object;
};
ol.format.CityGML.prototype.readLandUseFeature = function(node, objectStack) {
  var object = {
    id : node.getAttribute('gml:id'),
    type : 4,
    children : []
  };
  object = ol.xml.pushParseAndPop(object, this.CITYOBJECT_PARSER, node, objectStack, this);
  return object;
};
ol.format.CityGML.prototype.readTransportationComplexFeature = function(node, objectStack) {
  var object = {
    id : node.getAttribute('gml:id'),
    type : 42,
    children : []
  };
  object = ol.xml.pushParseAndPop(object, this.CITYOBJECT_PARSER, node, objectStack, this);
  return object;
};
ol.format.CityGML.prototype.readRailwayFeature = function(node, objectStack) {
  var object = {
    id : node.getAttribute('gml:id'),
    type : 44,
    children : []
  };
  object = ol.xml.pushParseAndPop(object, this.CITYOBJECT_PARSER, node, objectStack, this);
  return object;
};
ol.format.CityGML.prototype.readRoadFeature = function(node, objectStack) {
    var object = {
    id : node.getAttribute('gml:id'),
    type : 45,
    children : []
  };
  object = ol.xml.pushParseAndPop(object, this.CITYOBJECT_PARSER, node, objectStack, this);
  return object;
};
ol.format.CityGML.prototype.readTrackFeature = function(node, objectStack) {
  var object = {
    id : node.getAttribute('gml:id'),
    type : 43,
    children : []
  };
  object = ol.xml.pushParseAndPop(object, this.CITYOBJECT_PARSER, node, objectStack, this);
  return object;
};
ol.format.CityGML.prototype.readSquareFeature = function(node, objectStack) {
  var object = {
    id : node.getAttribute('gml:id'),
    type : 46,
    children : []
  };
  object = ol.xml.pushParseAndPop(object, this.CITYOBJECT_PARSER, node, objectStack, this);
  return object;
};
ol.format.CityGML.prototype.readSolitaryVegetationObjectFeature = function(node, objectStack) {
  var object = {
    id : node.getAttribute('gml:id'),
    type : 7,
    children : []
  };
  object = ol.xml.pushParseAndPop(object, this.CITYOBJECT_PARSER, node, objectStack, this);
  return object;
};
ol.format.CityGML.prototype.readPlantCoverFeature = function(node, objectStack) {
  var object = {
    id : node.getAttribute('gml:id'),
    type : 8,
    children : []
  };
  object = ol.xml.pushParseAndPop(object, this.CITYOBJECT_PARSER, node, objectStack, this);
  return object;
};
ol.format.CityGML.prototype.readWaterBodyFeature = function(node, objectStack) {
  var object = {
    id : node.getAttribute('gml:id'),
    type : 9,
    children : []
  };
  object = ol.xml.pushParseAndPop(object, this.CITYOBJECT_PARSER, node, objectStack, this);
  return object;
};
ol.format.CityGML.prototype.readBoundedByElement = function(node, objectStack) {
  var object = {
    id : null,
    type : '_3',
    attributes : {},
    children : []
  };
  object.attributes["extent"] = ol.xml.pushParseAndPop(object, ol.format.GML3.prototype.GEOMETRY_PARSERS_, node, objectStack, this);
  return object;
};

ol.format.CityGML.prototype.CITYOBJECT_PARSER = {
  'http://www.opengis.net/gml' : {
    "boundedBy" : ol.xml.makeObjectPropertyPusher(ol.format.CityGML.prototype.readBoundedByElement, 'children')
  }
};

goog.provide('ol.format.CityGML');

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
 * CityGML class for parsing, currently only used in WFS2Format for reading wfs:GetFeature response
 * Not suitable for other use currently.. *
 *
 * @constructor
 * @param {olx.format.GMLOptions=} opt_options
 *     Optional configuration object.
 * @extends {ol.format.XMLFeature}
 * @api stable
 */
ol.format.CityGML = function(opt_options) {
  var options = opt_options ? opt_options : {};


  /**
   * @private
   * @type {string}
   */
  this.schemaLocation_ = options.schemaLocation ?
      options.schemaLocation : ol.format.CityGML.SCHEMA_LOCATION;

  ol.format.XMLFeature.call(this);
};
ol.inherits(ol.format.CityGML, ol.format.XMLFeature);

/**
 * @const
 * @type {Array.<string>}
 */
ol.format.CityGML.NS = [
  'http://www.opengis.net/citygml/waterbody/2.0',
  'http://www.3dcitydb.org/citygml-ade/3.0',
  'http://www.opengis.net/citygml/2.0',
  'http://www.opengis.net/citygml/vegetation/2.0',
  'http://www.opengis.net/citygml/relief/2.0',
  'http://www.opengis.net/citygml/transportation/2.0',
  'http://www.opengis.net/citygml/building/2.0',
  'http://www.opengis.net/citygml/cityobjectgroup/2.0',
  'http://www.opengis.net/citygml/tunnel/2.0',
  'http://www.opengis.net/citygml/cityfurniture/2.0',
  'http://www.opengis.net/citygml/generics/2.0',
  'http://www.opengis.net/citygml/bridge/2.0',
  'http://www.w3.org/1999/xlink',
  'http://www.opengis.net/citygml/landuse/2.0',
  'http://www.opengis.net/citygml/waterbody/2.0'
];

/**
 * @const
 * @type {string}
 */
ol.format.CityGML.SCHEMA_LOCATION = 'http://schemas.opengis.net/citygml/waterbody/2.0/waterBody.xsd http://www.3dcitydb.org/citygml-ade/3.0 http://www.virtualcitysystems.de/3dcitydb/citygml-ade/3.0/3dcitydb-ade-citygml-2.0.xsd http://www.opengis.net/citygml/vegetation/2.0 http://schemas.opengis.net/citygml/vegetation/2.0/vegetation.xsd http://www.opengis.net/citygml/transportation/2.0 http://schemas.opengis.net/citygml/transportation/2.0/transportation.xsd http://www.opengis.net/citygml/relief/2.0 http://schemas.opengis.net/citygml/relief/2.0/relief.xsd http://www.opengis.net/citygml/building/2.0 http://schemas.opengis.net/citygml/building/2.0/building.xsd http://www.opengis.net/citygml/cityobjectgroup/2.0 http://schemas.opengis.net/citygml/cityobjectgroup/2.0/cityObjectGroup.xsd http://www.opengis.net/wfs/2.0 http://schemas.opengis.net/wfs/2.0/wfs.xsd http://www.opengis.net/citygml/tunnel/2.0 http://schemas.opengis.net/citygml/tunnel/2.0/tunnel.xsd http://www.opengis.net/citygml/cityfurniture/2.0 http://schemas.opengis.net/citygml/cityfurniture/2.0/cityFurniture.xsd http://www.opengis.net/citygml/generics/2.0 http://schemas.opengis.net/citygml/generics/2.0/generics.xsd http://www.opengis.net/citygml/bridge/2.0 http://schemas.opengis.net/citygml/bridge/2.0/bridge.xsd http://www.opengis.net/citygml/landuse/2.0 http://schemas.opengis.net/citygml/landuse/2.0/landUse.xsd';

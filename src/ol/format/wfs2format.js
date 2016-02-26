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
ol.format.WFS2 = function() {

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
ol.format.WFS2.prototype.readFeaturesFromNode = function(node, opt_options) {

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
ol.format.WFS2.prototype.handleWFSMember = function(node, objectStack) {
  goog.asserts.assert(node.nodeType == goog.dom.NodeType.ELEMENT,'node.nodeType should be ELEMENT');
  //var localName = ol.xml.getLocalName(node);
  var feature = ol.xml.pushParseAndPop([], this.cityGMLFormat_.TOP_LEVEL_FEATURE_PARSERS, node, objectStack, this.cityGMLFormat_);
  return feature;
};

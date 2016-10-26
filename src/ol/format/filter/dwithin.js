goog.provide('ol.format.filter.DWithin');

goog.require('ol');
goog.require('ol.format.filter.Spatial');


/**
 * @classdesc
 * Represents a `<Within>` operator to test whether a geometry-valued property
 * is within a given geometry.
 *
 * @constructor
 * @param {!string} geometryName Geometry name to use.
 * @param {!ol.geom.Geometry} geometry Geometry.
 * @param {!number} distance Distance.
 * @param {!number} unit Unit.
 * @param {string=} opt_srsName SRS name. No srsName attribute will be
 *    set on geometries when this is not provided.
 * @extends {ol.format.filter.Spatial}
 * @api
 */
ol.format.filter.DWithin = function(geometryName, geometry, distance, unit, opt_srsName) {
  ol.format.filter.Spatial.call(this, 'DWithin', geometryName, geometry, opt_srsName);

  /**
   * @public
   * @type {!number}
   */
  this.distance = distance;

  /**
   * @public
   * @type {!string}
   */
  this.unit = unit;
};
ol.inherits(ol.format.filter.DWithin, ol.format.filter.Spatial);

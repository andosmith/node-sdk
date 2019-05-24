"use strict";

const Service = require("../service");
const Models = require("./models");
const Fields = require("./fields");
const Items = require("./items");
const Settings = require("./settings");
const AuditLogs = require("./audit-logs");

/**
  Utility class to combine mixins
  @see http://justinfagnani.com/2015/12/21/real-mixins-with-javascript-classes/
 */
class MixinBuilder {
  constructor(superclass) {
    this.superclass = superclass;
  }

  with(...mixins) {
    return mixins.reduce((c, mixin) => mixin(c), this.superclass);
  }
}
let mix = superclass => new MixinBuilder(superclass);

/**
  Instance Class
  Using mixins we combine sub-classes with the Service superclass to generate the `Instance` class
 */
// Instance -> mixin(Model) | mixin(Item) | etc -> Service
module.exports = class Instance extends mix(Service).with(
  Models.mixin,
  Fields.mixin,
  Items.mixin,
  Settings.mixin,
  AuditLogs.mixin
) {
  constructor(instanceZUID, token, options = {}) {
    if (!instanceZUID) {
      throw new Error(
        "SDK:Instance:constructor() missing required `instanceZUID` argument on instantiation"
      );
    }

    const baseAPI =
      options.instancesAPIURL ||
      process.env.ZESTY_INSTANCE_API ||
      `https://${instanceZUID}.api.zesty.io/v1`;

    // Legacy API endpoints
    // TODO retire these endpoints
    const sitesServiceURL =
      options.sitesServiceURL ||
      process.env.ZESTY_INSTANCE_LEGACY_API ||
      `https://svc.zesty.io/sites-service/${instanceZUID}`;

    // Instantiate Service class
    super(baseAPI, token, options);

    // TODO retire these endpoints
    this.legacy = new Service(sitesServiceURL, token);
    this.legacy.API = {
      ...Items.legacy.API
    };

    this.API = {
      ...Models.API,
      ...Fields.API,
      ...Items.API,
      ...Settings.API,
      ...AuditLogs.API
    };
  }

  formatPath(path) {
    if (!path) {
      throw new Error(
        "SDK:Instance:formatPath() missing required `path` argument"
      );
    }
    return path
      .trim()
      .toLowerCase()
      .replace(/\&/g, "and")
      .replace(/[^a-zA-Z0-9]/g, "-");
  }
};

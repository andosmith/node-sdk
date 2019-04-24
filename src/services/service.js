"use strict";

const request = require("request");
const cookie = require("cookie");

module.exports = class Service {
  constructor(baseAPI, token) {
    if (!baseAPI) {
      throw new Error(
        "SDK:Service:constructor() missing required `baseAPI` argument on instantiation"
      );
    }

    if (!token) {
      throw new Error(
        "SDK:Service:constructor() missing required `token` argument on instantiation. All API requests have to be authenticated"
      );
    }

    this.baseAPI = baseAPI;
    this.token = token;

    this.cookieName = process.env.COOKIE || "APP_SID";
  }

  interpolate(url, replacementObject) {
    for (const key in replacementObject) {
      url = url.replace(key, replacementObject[key]);
    }

    return url;
  }

  async getRequest(uri, params = {}) {
    if (!params.hasOwnProperty("successCode")) {
      params.successCode = 200;
    }

    return this.request(uri, {
      ...params,
      method: "GET"
    });
  }

  async deleteRequest(uri, params = {}) {
    if (!params.hasOwnProperty("successCode")) {
      params.successCode = 200;
    }

    return this.request(uri, {
      ...params,
      method: "DELETE"
    });
  }

  async putRequest(uri, params = {}) {
    if (!params.hasOwnProperty("successCode")) {
      params.successCode = 200;
    }

    return this.request(uri, {
      ...params,
      method: "PUT"
    });
  }

  async postRequest(uri, params = {}) {
    if (!params.hasOwnProperty("successCode")) {
      params.successCode = 201;
    }

    return this.request(uri, {
      ...params,
      method: "POST"
    });
  }

  async patchRequest(uri, params = {}) {
    if (!params.hasOwnProperty("successCode")) {
      params.successCode = 200;
    }

    return this.request(uri, {
      ...params,
      method: "PATCH"
    });
  }

  request(uri, params) {
    return new Promise((resolve, reject) => {
      const opts = {
        method: params.method,
        uri: `${this.baseAPI}${uri}`,
        json: true,
        headers: {},
        auth: {
          bearer: this.token
        }
      };

      if (params.usesCookieAuth) {
        opts.headers["Cookie"] = cookie.serialize(this.cookieName, this.token);
      }

      if (params.usesXAuthHeader) {
        opts.headers["X-Auth"] = this.token;
      }

      if (params.payload) {
        if (params.isFormData) {
          opts.formData = params.payload;
        } else {
          opts.body = params.payload;
        }
      }

      // Use the "request" module to make request
      request(opts, (error, response, body) => {
        if (error) {
          reject(error);
        } else {
          // Add response status code
          const enrichedBody = { statusCode: response.statusCode, ...body };
          const formattedBody = params.responseFormatter
            ? params.responseFormatter(enrichedBody)
            : enrichedBody;

          resolve(formattedBody);
        }
      });
    });
  }
};

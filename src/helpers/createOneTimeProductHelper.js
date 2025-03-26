"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var stripe_1 = require("stripe");
var stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY);
console.log(stripe);

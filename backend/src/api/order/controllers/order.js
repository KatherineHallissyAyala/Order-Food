"use strict";
const stripe = require("stripe")(
    "sk_test_51O4Rg9DEQDRybUpRRD3FTHi9Xg7PZ03DZLjLhFp70WkDQYJ0dGTR5RXQiPMXbO3nbSVWqSx3WKXkZma0tdpPYsQe00PiIfgEhB"
  );
/**
 *  order controller
 */
const { createCoreController } = require("@strapi/strapi").factories;
module.exports = createCoreController("api::order.order", ({ strapi }) => ({
  async create(ctx) {
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized("You are not authorized!");
    }

    console.log(ctx.request.body.data);
    console.log(ctx.state.user.id);
    console.log("order controller");

    const { address, amount, dishes, token, city, state } =
      ctx.request.body.data;
    
    try {
      // Charge the customer
      const charge = await stripe.charges.create({
        // Transform cents to dollars.
        amount: amount,
        currency: "usd",
        description: `Order ${new Date()}`,
        source: token,
      });

      // Create the order
      const order = await strapi.entityService.create("api::order.order", {
        data: {
          user: ctx.state.user.id,
          amount,
          address,
          dishes,
          city,
          state,
          token,
          //publishedAt: new Date().getTime(),
        },
      });
      return order;
    } catch (err) {
      // return 500 error
      console.log("err", err);
      ctx.response.status = 500;
      return {
        error: { message: "There was a problem creating the charge" },
        address,
        amount,
        dishes,
        token,
        city,
        state,
      };
    }
  },
}));
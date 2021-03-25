const midtransClient = require("midtrans-client");

module.exports = {
  createPayment: (bookingId, nominal) => {
    return new Promise((resolve, reject) => {
      let snap = new midtransClient.Snap({
        isProduction: false,
        serverKey: "SB-Mid-server-juLsGW6j_AxrxRzJ2yS5CyMd",
        clientKey: "SB-Mid-client-Zr3pJ1_V8tr4Y6ds",
      });
      let parameter = {
        transaction_details: {
          order_id: bookingId,
          gross_amount: nominal,
        },
        credit_card: {
          secure: true,
        },
      };
      snap
        .createTransaction(parameter)
        .then((transaction) => {
          // transaction redirect_url
          console.log(transaction);
          //   const redirectUrl = transaction.redirect_url;
          resolve(transaction);
        })
        .catch((error) => {
          console.log(error);
          reject(error);
        });
    });
  },
};

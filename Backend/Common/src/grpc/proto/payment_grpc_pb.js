// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('@grpc/grpc-js');
var payment_pb = require('./payment_pb.js');

function serialize_finance_payment_PaymentRequest(arg) {
  if (!(arg instanceof payment_pb.PaymentRequest)) {
    throw new Error('Expected argument of type finance.payment.PaymentRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_finance_payment_PaymentRequest(buffer_arg) {
  return payment_pb.PaymentRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_finance_payment_PaymentResponse(arg) {
  if (!(arg instanceof payment_pb.PaymentResponse)) {
    throw new Error('Expected argument of type finance.payment.PaymentResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_finance_payment_PaymentResponse(buffer_arg) {
  return payment_pb.PaymentResponse.deserializeBinary(new Uint8Array(buffer_arg));
}


var PaymentServiceService = exports.PaymentServiceService = {
  initializePayment: {
    path: '/finance.payment.PaymentService/initializePayment',
    requestStream: false,
    responseStream: false,
    requestType: payment_pb.PaymentRequest,
    responseType: payment_pb.PaymentResponse,
    requestSerialize: serialize_finance_payment_PaymentRequest,
    requestDeserialize: deserialize_finance_payment_PaymentRequest,
    responseSerialize: serialize_finance_payment_PaymentResponse,
    responseDeserialize: deserialize_finance_payment_PaymentResponse,
  },
};

exports.PaymentServiceClient = grpc.makeGenericClientConstructor(PaymentServiceService, 'PaymentService');

// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('@grpc/grpc-js');
var holiday_pb = require('./holiday_pb.js');

function serialize_common_holiday_BoolResponse(arg) {
  if (!(arg instanceof holiday_pb.BoolResponse)) {
    throw new Error('Expected argument of type common.holiday.BoolResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_common_holiday_BoolResponse(buffer_arg) {
  return holiday_pb.BoolResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_common_holiday_DateRequest(arg) {
  if (!(arg instanceof holiday_pb.DateRequest)) {
    throw new Error('Expected argument of type common.holiday.DateRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_common_holiday_DateRequest(buffer_arg) {
  return holiday_pb.DateRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_common_holiday_DateResponse(arg) {
  if (!(arg instanceof holiday_pb.DateResponse)) {
    throw new Error('Expected argument of type common.holiday.DateResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_common_holiday_DateResponse(buffer_arg) {
  return holiday_pb.DateResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_common_holiday_Empty(arg) {
  if (!(arg instanceof holiday_pb.Empty)) {
    throw new Error('Expected argument of type common.holiday.Empty');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_common_holiday_Empty(buffer_arg) {
  return holiday_pb.Empty.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_common_holiday_HolidayListResponse(arg) {
  if (!(arg instanceof holiday_pb.HolidayListResponse)) {
    throw new Error('Expected argument of type common.holiday.HolidayListResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_common_holiday_HolidayListResponse(buffer_arg) {
  return holiday_pb.HolidayListResponse.deserializeBinary(new Uint8Array(buffer_arg));
}


var HolidayServiceService = exports.HolidayServiceService = {
  isHoliday: {
    path: '/common.holiday.HolidayService/IsHoliday',
    requestStream: false,
    responseStream: false,
    requestType: holiday_pb.DateRequest,
    responseType: holiday_pb.BoolResponse,
    requestSerialize: serialize_common_holiday_DateRequest,
    requestDeserialize: deserialize_common_holiday_DateRequest,
    responseSerialize: serialize_common_holiday_BoolResponse,
    responseDeserialize: deserialize_common_holiday_BoolResponse,
  },
  getNextBusinessDay: {
    path: '/common.holiday.HolidayService/GetNextBusinessDay',
    requestStream: false,
    responseStream: false,
    requestType: holiday_pb.DateRequest,
    responseType: holiday_pb.DateResponse,
    requestSerialize: serialize_common_holiday_DateRequest,
    requestDeserialize: deserialize_common_holiday_DateRequest,
    responseSerialize: serialize_common_holiday_DateResponse,
    responseDeserialize: deserialize_common_holiday_DateResponse,
  },
  getPreviousBusinessDay: {
    path: '/common.holiday.HolidayService/GetPreviousBusinessDay',
    requestStream: false,
    responseStream: false,
    requestType: holiday_pb.DateRequest,
    responseType: holiday_pb.DateResponse,
    requestSerialize: serialize_common_holiday_DateRequest,
    requestDeserialize: deserialize_common_holiday_DateRequest,
    responseSerialize: serialize_common_holiday_DateResponse,
    responseDeserialize: deserialize_common_holiday_DateResponse,
  },
  getHolidayList: {
    path: '/common.holiday.HolidayService/GetHolidayList',
    requestStream: false,
    responseStream: false,
    requestType: holiday_pb.Empty,
    responseType: holiday_pb.HolidayListResponse,
    requestSerialize: serialize_common_holiday_Empty,
    requestDeserialize: deserialize_common_holiday_Empty,
    responseSerialize: serialize_common_holiday_HolidayListResponse,
    responseDeserialize: deserialize_common_holiday_HolidayListResponse,
  },
};

exports.HolidayServiceClient = grpc.makeGenericClientConstructor(HolidayServiceService, 'HolidayService');

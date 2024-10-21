import mongoose from "mongoose";

/** Interface that describes how to create a new Log */
interface ILogAttrs {
   id: string;
   service: string;
   level: string;
   message: string;
   timestamp: Date;
}
/** Interface that describes the ppts a Log model has */
interface LogModel extends mongoose.Model<LogDoc> {
   build(attrs: ILogAttrs): LogDoc;
}
/** Interface that describes  the ppts a Log Document has */
interface LogDoc extends mongoose.Document {
   service: string;
   level: string;
   message: string;
   timestamp: Date;
}

const logSchema = new mongoose.Schema({
   service: {
      type: String,
      required: true,
   },
   level: {
      type: String,
      required: true,
   },
   message: {
      type: String,
      required: true,
   },
   timestamp: {
      type: Date,
      required: true,
   }
}, {
   toJSON: {
      transform(doc, ret) {
         ret.id = ret._id;
         delete ret._id
      }
   }
});
logSchema.statics.build = (attrs: ILogAttrs)=>{
   return new Log({...attrs, ...(attrs.id && {_id: attrs.id})})
}

const Log = mongoose.model<LogDoc, LogModel>('Log', logSchema);


export { Log }
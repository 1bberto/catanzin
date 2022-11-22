import { Schema } from "mongoose";
import uuid from "node-uuid";

var UserId = {
  type: Schema.Types.ObjectId,
  ref: "User"
};

var SessionSchema = new Schema({
  user: UserId,
  type: { type: String, enum: ["web"], default: "web" },
  token: { type: String, default: uuid },
  created: { type: Date, default: Date.now },
  scope: [String],

  lastActive: { type: Date },
  ipAddress: String,
  userAgent: String
});

SessionSchema.virtual("id").get(function() {
  return this._id.toString();
});

SessionSchema.methods.toSession = function() {
  return {
    id: this.id,
    token: this.token
  };
};

SessionSchema.methods.toJSON = function() {
  return {
    id: this.id,
    user: this.user,
    created: this.created,
    lastActive: this.lastActive,
    ipAddress: this.ipAddress,
    userAgent: this.userAgent
  };
};

export default SessionSchema;

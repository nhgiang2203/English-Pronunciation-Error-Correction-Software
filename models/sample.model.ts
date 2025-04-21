import mongoose from "mongoose";
import slug from "mongoose-slug-updater";
mongoose.plugin(slug);

const sampleSchema = new mongoose.Schema({
  title: String,
  questions: {
    type: [[String]],
    required: true
  },
  answers: {
    type: [[String]],
    required: true
  },
  status: String,
  deleted: {
    type: Boolean,
    default: false
  },
  slug: {
    type: String,
    slug: "title",
    unique: true
  }

  
}, {
  timestamps: true
}
);

const Sample = mongoose.model("Sample", sampleSchema, "samples");
export default Sample;



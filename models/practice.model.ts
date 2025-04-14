import mongoose from "mongoose";
import slug from "mongoose-slug-updater";
mongoose.plugin(slug);

const practiceSchema = new mongoose.Schema({
  title: String,
  questions: [
    {
      _id: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
      text: String
    }
  ],
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

const Practice = mongoose.model("Practice", practiceSchema, "practices");
export default Practice;
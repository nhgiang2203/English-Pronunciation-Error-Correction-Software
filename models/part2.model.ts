import mongoose from "mongoose";
import slug from "mongoose-slug-updater";
mongoose.plugin(slug);

const part2Schema = new mongoose.Schema({
  title: String,
  content: String,
  slug: {
    type: String,
    slug: "title",
    unique: true
  },
  status: String,
  deleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const Part2 = mongoose.model('Part2', part2Schema, 'part2');
export default Part2;
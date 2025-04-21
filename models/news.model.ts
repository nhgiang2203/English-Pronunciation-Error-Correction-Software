import mongoose from "mongoose";
import slug from 'mongoose-slug-updater';
mongoose.plugin(slug);

const newsSchema = new mongoose.Schema({
  title: String,
  img: String,
  content: String,
  status: String,
  deleted: {
    type: Boolean,
    default: false
  },
  slug: {
    type: String,
    slug: 'title',
    unique: true
  }
}, {
  timestamps: true
});

const News = mongoose.model('News', newsSchema, 'news');
export default News;
import mongoose from "mongoose";

const myAnswerSchema = new mongoose.Schema({
  userId: String,
  topic: String,
  question: String,
  answer: String,
  pronunciationData: {
    highlighted_sentence: String,
    highlighted_ipa: String,
    answerOriginal: String,
    score: Number
  },
  suggestData: {
    grammar_explanation: String,
    relevance: String,
    suggested_band_higher_answer: String
  },
  deleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const MyAnswer = mongoose.model('MyAnswer', myAnswerSchema, 'my-answer');
export default MyAnswer;
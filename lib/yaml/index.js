import { parse } from './parse-cst.js';
import Document from './documents.js';
import './resolveseq.js';

export default (src) => {
  const cst = parse(src);
  const doc = new Document().parse(cst[0]);
  return doc.toJSON();
};

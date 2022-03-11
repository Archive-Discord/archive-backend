import NodeCache from "node-cache"

const nodeCache = new NodeCache({ stdTTL: 60 * 10 });
export default nodeCache;



import app from "./app.js";
import { flushEvents } from "./jobs/flushEvents.job.js";

const port = process.env.PORT || 3000;

flushEvents().catch((err) => console.error("Failed to register flush job:", err));

app.listen(port, () => {
    console.log("app listening at Port", port);
});

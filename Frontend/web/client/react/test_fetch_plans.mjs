import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const savePlanBaseUrl = `${process.env.VITE_SAVEPLAN_BASE_URL}/save-plan`;

async function test() {
  try {
    const res = await axios.get(`${savePlanBaseUrl}/list/planin`);
    console.log("Planin rows length:", res.data.data.rows.length);
    const plan = res.data.data.rows.find(r => r.title.includes("Save A Million"));
    if (plan) {
      console.log("Save A Million logo:", plan.logo);
      console.log("Save A Million icon:", plan.icon);
    } else {
      console.log("Save A Million not found in planin.");
    }
  } catch (e) {
    console.error(e.message);
  }
}
test();

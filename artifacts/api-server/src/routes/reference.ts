import { Router } from "express";
import {
  COUNTRIES,
  AIRPORTS,
  withFlag,
  withCountry,
  getCountry,
  searchCountries,
  searchAirports,
  airportsByCountry,
} from "@workspace/reference";

const router = Router();

/* Countries -------------------------------------------------------------- */

router.get("/reference/countries", (_req, res) => {
  res.json(COUNTRIES.map(withFlag));
});

// `/search` must be registered before `/:countryCode`.
router.get("/reference/countries/search", (req, res) => {
  const q = typeof req.query.q === "string" ? req.query.q : "";
  res.json(searchCountries(q).map(withFlag));
});

router.get("/reference/countries/:countryCode/airports", (req, res) => {
  res.json(airportsByCountry(req.params.countryCode).map(withCountry));
});

router.get("/reference/countries/:countryCode", (req, res) => {
  const country = getCountry(req.params.countryCode);
  if (!country) {
    res.status(404).json({ error: "Country not found" });
    return;
  }
  res.json(withFlag(country));
});

/* Airports --------------------------------------------------------------- */

router.get("/reference/airports", (_req, res) => {
  res.json(AIRPORTS.map(withCountry));
});

router.get("/reference/airports/search", (req, res) => {
  const q = typeof req.query.q === "string" ? req.query.q : "";
  res.json(searchAirports(q).map(withCountry));
});

export default router;

import { Request, Response } from "express";
import externalApiService from "../services/externalApiService";
import logger from "../utils/logger";

class CountryController {
  async migrateDatatoDB(req: Request, res: Response) {
    try {
      await externalApiService.migrateCountriesData();
    } catch (err: any) {
      console.error("Error migrating data:", err.message);
      return res.status(500).json({
        message: "Error migrating data",
        error: err.message,
      });
    }
  }

  public async fetchAllCountries(req: Request, res: Response): Promise<void> {
    try {
      // Extract query parameters from the request
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;
      const fields = req.query.fields as string | undefined;
      const region = req.query.region as string | undefined;
      const population = req.query.population
        ? parseInt(req.query.population as string, 10)
        : undefined;

      const countries = await externalApiService.fetchAllCountries({
        page,
        limit,
        fields,
        region,
        population,
      });

      logger.info('Fetched countries data successfully')
      
      res.status(200).json(countries);
    } catch (err: any) {
      console.error("Error fetching countries", err);
      res
        .status(500)
        .json({ message: "An error occurred while fetching countries" });
    }
  }

  public async fetchCountryDetails(req: Request, res: Response): Promise<void> {
    try {
      const code = req.params.code;
      const country = await externalApiService.fetchCountryDetails(code);

      logger.info(`Fetched country information by code: ${code}`, { country });

      if (!country || country.length === 0) {
        res.status(404).json({ message: "Country not found" });
        return;
      }

      res.status(200).json(country);
    } catch (err: any) {
      console.error("Error fetching country details", err);
      res
        .status(500)
        .json({ message: "An error occurred while fetching country details" });
    }
  }

  async getRegions(req: Request, res: Response) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;

      const regionsData = await externalApiService.getRegions({ page, limit });
      logger.info('Successfully fetched regions data', { regionsData });

      return res.status(200).json({
        message: "Regions data fetched successfully",
        data: regionsData,
      });
    } catch (err: any) {
      logger.error('Error fetching regions data', { error: err.message });
      return res.status(500).json({
        message: "Error fetching regions data",
        error: err.message,
      });
    }
  }

  async getLanguages(req: Request, res: Response) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;

      const languagesData = await externalApiService.getLanguagesData({
        page,
        limit,
      });
      logger.info('Successfully fetched languages data', { languagesData });

      return res.status(200).json({
        message: "Languages data fetched successfully",
        data: languagesData,
      });
    } catch (err: any) {
      logger.error("Error fetching languages data:", { error: err.message });
      return res.status(500).json({
        message: "Error fetching languages data",
        error: err.message,
      });
    }
  }

  async getStatistics(req: Request, res: Response) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;

      const statisticsData = await externalApiService.getStatistics({
        page,
        limit,
      });
      logger.info(`statisticsData fetched successfully`, { statisticsData })

      return res.status(200).json({
        message: "Statistics data fetched successfully",
        data: statisticsData,
      });
      
    } catch (err: any) {
      console.error("Error fetching statistics data:", err.message);
      return res.status(500).json({
        message: "Error fetching statistics data",
        error: err.message,
      });
    }
  }
}

export default new CountryController();

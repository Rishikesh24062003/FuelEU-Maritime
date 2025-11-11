import { Prisma, PrismaClient, Route as PrismaRouteModel } from '@prisma/client';
import { Route } from '../../../core/domain/Route';
import {
  RouteRepository,
  CreateRouteDTO,
  UpdateRouteDTO,
} from '../../../ports/repositories/RouteRepository';

export class PrismaRouteRepo implements RouteRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async getAllRoutes(): Promise<Route[]> {
    const routes = await this.prisma.route.findMany();
    return routes.map((route) => this.toDomain(route));
  }

  async getRouteById(id: number): Promise<Route | null> {
    const route = await this.prisma.route.findUnique({ where: { id } });
    return route ? this.toDomain(route) : null;
  }

  async getRoutesByYear(year: number): Promise<Route[]> {
    const routes = await this.prisma.route.findMany({ where: { year } });
    return routes.map((route) => this.toDomain(route));
  }

  async getBaselineRoute(year: number): Promise<Route | null> {
    const route = await this.prisma.route.findFirst({
      where: {
        year,
        isBaseline: true,
      },
    });
    return route ? this.toDomain(route) : null;
  }

  async createRoute(payload: CreateRouteDTO): Promise<Route> {
    const created = await this.prisma.route.create({
      data: {
        routeId: payload.routeId,
        vesselType: payload.vesselType,
        fuelType: payload.fuelType,
        year: payload.year,
        ghgIntensity: payload.ghgIntensity,
        fuelConsumption: payload.fuelConsumption,
        distance: payload.distance,
        totalEmissions: payload.totalEmissions,
        isBaseline: payload.isBaseline ?? false,
      },
    });

    return this.toDomain(created);
  }

  async updateRoute(id: number, payload: UpdateRouteDTO): Promise<Route> {
    const updated = await this.prisma.route.update({
      where: { id },
      data: {
        ...(payload.vesselType !== undefined && { vesselType: payload.vesselType }),
        ...(payload.fuelType !== undefined && { fuelType: payload.fuelType }),
        ...(payload.year !== undefined && { year: payload.year }),
        ...(payload.fuelConsumption !== undefined && { fuelConsumption: payload.fuelConsumption }),
        ...(payload.distance !== undefined && { distance: payload.distance }),
        ...(payload.ghgIntensity !== undefined && { ghgIntensity: payload.ghgIntensity }),
        ...(payload.totalEmissions !== undefined && { totalEmissions: payload.totalEmissions }),
        ...(payload.isBaseline !== undefined && { isBaseline: payload.isBaseline }),
      },
    });

    return this.toDomain(updated);
  }

  async setBaseline(routeId: string): Promise<Route | null> {
    const updated = await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const target = await tx.route.findUnique({ where: { routeId } });
      if (!target) {
        return null;
      }

      await tx.route.updateMany({
        where: {
          year: target.year,
          isBaseline: true,
        },
        data: { isBaseline: false },
      });

      return tx.route.update({
        where: { routeId },
        data: { isBaseline: true },
      });
    });

    return updated ? this.toDomain(updated) : null;
  }

  async deleteRoute(id: number): Promise<void> {
    await this.prisma.route.delete({ where: { id } });
  }

  private toDomain(prismaRoute: PrismaRouteModel): Route {
    return {
      id: prismaRoute.id,
      routeId: prismaRoute.routeId,
      vesselType: prismaRoute.vesselType,
      fuelType: prismaRoute.fuelType,
      year: prismaRoute.year,
      ghgIntensity: prismaRoute.ghgIntensity,
      fuelConsumption: prismaRoute.fuelConsumption,
      distance: prismaRoute.distance,
      totalEmissions: prismaRoute.totalEmissions,
      isBaseline: prismaRoute.isBaseline,
    };
  }
}

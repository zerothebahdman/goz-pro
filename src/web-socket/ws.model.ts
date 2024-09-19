export const gateWayEvents = <const>['connection', 'disconnect', 'error'];
export type GateWayEvent = (typeof gateWayEvents)[number];

export const deliveryEvents = <const>['location_changed', 'status_changed', 'delivery_updated'];
export type DeliveryEvent = (typeof deliveryEvents)[number];

export type EventName = GateWayEvent | DeliveryEvent;

export interface EventQueue {
  status?: string;
  message?: string;
  user_id?: string;
  event?: EventName;
  data?: { [key: string]: any };
}

export interface EventResponse<T> {
  status: string;
  message: string;
  user_id: string;
  data: T;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  total_pages: number;
  nextPage: number | null;
  prevPage: number | null;
}

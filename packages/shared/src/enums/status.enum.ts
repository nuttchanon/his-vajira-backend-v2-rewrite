export enum PatientStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DECEASED = 'deceased',
}

export enum EncounterStatus {
  PLANNED = 'planned',
  ARRIVED = 'arrived',
  IN_PROGRESS = 'in-progress',
  ONLEAVE = 'onleave',
  FINISHED = 'finished',
  CANCELLED = 'cancelled',
}

export enum RequestStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
  ENTERED_IN_ERROR = 'entered-in-error',
  UNKNOWN = 'unknown',
}

export enum RequestIntent {
  PROPOSAL = 'proposal',
  PLAN = 'plan',
  DIRECTIVE = 'directive',
  ORDER = 'order',
  ORIGINAL_ORDER = 'original-order',
  REFLEX_ORDER = 'reflex-order',
  FILLER_ORDER = 'filler-order',
  INSTANCE_ORDER = 'instance-order',
  OPTION = 'option',
}

export enum RequestPriority {
  ROUTINE = 'routine',
  URGENT = 'urgent',
  ASAP = 'asap',
  STAT = 'stat',
}

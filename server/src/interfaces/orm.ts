
// temporary props will not be saved and will be hidden from the client (agro, combat ticks)
export const PROP_TEMPORARY = () => ({ hidden: true, persist: false });

// unsaved&shared props will not persist to the database but will be shared with client (FOV, calculated variables)
export const PROP_UNSAVED_SHARED = () => ({ persist: false });

// server-only props are only used on the server, and are persisted to the database (createdAt, password, other sensitive props)
export const PROP_SERVER_ONLY = () => ({ hidden: true });

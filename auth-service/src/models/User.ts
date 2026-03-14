export type UserId = number;

export interface User {
  id: UserId;
  email: string;
  firstName: string;
  lastName: string;
  passwordHash: string;
  createdAt: Date;
}

// représentation d'un utilisateur sans le passwordHash, pour les réponses API
export type UserPublic = Omit<User, "passwordHash">;

// Types d'input pour les routes d'inscription
export type RegisterInput = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};

//types d'input pour les routes de connexion
export type LoginInput = {
  email: string;
  password: string;
};

// Représentation d'une ligne de la table users dans la BDD
export type UserRow = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  password_hash: string;
  created_at: Date | string;
};

// Fonctions de mapping entre UserRow (BDD) et User (application)
export const toUser = (row: UserRow): User => ({
  id: row.id,
  email: row.email,
  passwordHash: row.password_hash,
  firstName: row.first_name,
  lastName: row.last_name,
  createdAt: row.created_at instanceof Date ? row.created_at : new Date(row.created_at),
});

// Fonction de mapping pour exposer uniquement les champs publics de l'utilisateur
export const toPublicUser = (user: User): UserPublic => ({
  id: user.id,
  email: user.email,
  firstName: user.firstName,
  lastName: user.lastName,
  createdAt: user.createdAt,
});

// Payload JWT (recommandé minimal)
export type AuthTokenPayload = {
  sub: string; // user id en string
  email: string;
};
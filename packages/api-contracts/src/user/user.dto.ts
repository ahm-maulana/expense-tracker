export interface UserDto {
	id: string;
	name: string;
	email: string;
}

export interface UserProfileDto extends UserDto {
	createdAt: Date;
	updatedAt: Date;
}

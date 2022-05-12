import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";

import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";
import { v4 as uuid } from "uuid";
import { AppError } from "../../../../shared/errors/AppError";

let showUserProfileUseCase: ShowUserProfileUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;

describe("ShowUserProfileUseCase", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    showUserProfileUseCase = new ShowUserProfileUseCase(
      inMemoryUsersRepository
    );
  });

  it("should be able to get user profile by email", () => {
    const user = inMemoryUsersRepository.create({
      name: "Danilo Vieira",
      email: "danilo@rocketseat.com",
      password: "minhasenha",
    });

    const findUser = showUserProfileUseCase.execute(user.id);

    expect(findUser).toMatchObject(user);
  });

  it("should not be able to show profile of a non existing user", async () => {
    await expect(showUserProfileUseCase.execute(uuid())).rejects.toEqual(
      new AppError("User not found", 404)
    );
  });
});

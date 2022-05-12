import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { AppError } from "../../../../shared/errors/AppError";

import { GetBalanceUseCase } from "./GetBalanceUseCase";

import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { v4 } from "uuid";

let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
let getBalanceUseCase: GetBalanceUseCase;
let userCreated: ICreateUserDTO;

describe("Get Balance Statement", () => {
  beforeAll(async () => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    const user = {
      name: "Caio Test",
      email: "camondoni@gmail.com",
      password: "senhasegura",
    };

    await inMemoryUsersRepository.create({
      name: user.name,
      email: user.email,
      password: user.password,
    });

    userCreated = await inMemoryUsersRepository.findByEmail(user.email);
  });
  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    getBalanceUseCase = new GetBalanceUseCase(
      inMemoryStatementsRepository,
      inMemoryUsersRepository
    );
  });

  it("should be able to get balance", async () => {
    const balance = await getBalanceUseCase.execute({
      user_id: userCreated.id,
    });
    expect(balance).toHaveProperty("balance");
  });

  it("should not be able to get balance", async () => {
    await expect(
      getBalanceUseCase.execute({
        user_id: v4(),
      })
    ).rejects.toEqual(new AppError("User not found", 404));
  });
});

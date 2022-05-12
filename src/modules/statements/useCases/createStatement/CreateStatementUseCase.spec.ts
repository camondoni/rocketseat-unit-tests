import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { AppError } from "../../../../shared/errors/AppError";

import { CreateStatementUseCase } from "./CreateStatementUseCase";

import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { v4 } from "uuid";

let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
let createStatementUseCase: CreateStatementUseCase;
let userCreated: ICreateUserDTO;

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}

describe("Create Statement User", () => {
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
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });

  it("should be able to create a new statement deposit", async () => {
    const statementCreated = await createStatementUseCase.execute({
      user_id: userCreated.id,
      type: "deposit" as OperationType,
      amount: 500,
      description: "Sálario",
    });
    expect(statementCreated).toHaveProperty("id");
  });

  it("should not be able to create a new statement invalid user", async () => {
    await expect(
      createStatementUseCase.execute({
        user_id: v4(),
        type: "deposit" as OperationType,
        amount: 500,
        description: "Sálario",
      })
    ).rejects.toEqual(new AppError("User not found", 404));
  });

  it("should be able to create a new statement withdraw", async () => {
    await inMemoryStatementsRepository.create({
      user_id: userCreated.id,
      type: "deposit" as OperationType,
      amount: 500,
      description: "Sálario",
    });

    const statementCreated = await createStatementUseCase.execute({
      user_id: userCreated.id,
      type: "withdraw" as OperationType,
      amount: 450,
      description: "Saque",
    });
    expect(statementCreated).toHaveProperty("id");
  });

  it("should not be able to create a new statement withdraw", async () => {
    const { balance } = await inMemoryStatementsRepository.getUserBalance(
      userCreated.id
    );
    await expect(
      createStatementUseCase.execute({
        user_id: userCreated.id,
        type: "withdraw" as OperationType,
        amount: balance + 5000,
        description: "Pagamento da pizza com falha",
      })
    ).rejects.toEqual(new AppError("Insufficient funds", 400));
  });
});

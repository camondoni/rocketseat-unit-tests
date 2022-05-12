import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { AppError } from "../../../../shared/errors/AppError";

import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { v4 } from "uuid";

let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
let getStatementOperationUseCase: GetStatementOperationUseCase;
let userCreated: ICreateUserDTO;

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}

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
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });

  it("should be able to get balance", async () => {
    const statementCreated = await inMemoryStatementsRepository.create({
      user_id: userCreated.id,
      type: "deposit" as OperationType,
      amount: 500,
      description: "Sálario",
    });

    const statementOperation = await getStatementOperationUseCase.execute({
      user_id: userCreated.id,
      statement_id: statementCreated.id,
    });

    expect(statementOperation).toHaveProperty("type");
  });

  it("should not be able to get statement operation not found", async () => {
    await expect(
      getStatementOperationUseCase.execute({
        user_id: userCreated.id,
        statement_id: v4(),
      })
    ).rejects.toEqual(new AppError("Statement not found", 404));
  });

  it("should not be able to get statement operation invalid user", async () => {
    await expect(
      getStatementOperationUseCase.execute({
        user_id: v4(),
        statement_id: v4(),
      })
    ).rejects.toEqual(new AppError("User not found", 404));
  });
});

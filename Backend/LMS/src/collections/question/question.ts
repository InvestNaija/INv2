import { Item } from 'postman-collection';

export class CreateQuestion {
    static item() {
        return new Item({
            name: `Create Question`,
            description: `API to create a new question. Requires authentication.`,
            request: {
                header: [
                    { key: "Content-Type", value: "application/json" },
                    { key: "Authorization", value: "Bearer {{accessToken}}" }
                ],
                url: "{{baseUrl}}/question",
                method: 'POST',
                body: {
                    mode: 'raw',
                    raw: JSON.stringify({
                        title: "What is the capital of Nigeria?",
                        details: "Select the correct capital city from the options below.",
                        type: "SINGLE_CHOICE"
                    }, null, 2),
                },
            },
        });
    }
}

export class UpdateQuestion {
    static item(id: string = "{{questionId}}") {
        return new Item({
            name: `Update Question`,
            description: `API to update an existing question. Requires authentication.`,
            request: {
                header: [
                    { key: "Content-Type", value: "application/json" },
                    { key: "Authorization", value: "Bearer {{accessToken}}" }
                ],
                url: `{{baseUrl}}/question/${id}`,
                method: 'PUT',
                body: {
                    mode: 'raw',
                    raw: JSON.stringify({
                        title: "Updated Question Title",
                        details: "Updated question details",
                        type: "MULTIPLE_CHOICE"
                    }, null, 2),
                },
            },
        });
    }
}

export class GetQuestionById {
    static item(id: string = "{{questionId}}") {
        return new Item({
            name: `Get Question by ID`,
            description: `API to get a specific question by ID. Requires authentication.`,
            request: {
                header: [
                    { key: "Accept", value: "application/json" },
                    { key: "Authorization", value: "Bearer {{accessToken}}" }
                ],
                url: `{{baseUrl}}/question/${id}`,
                method: 'GET',
            },
        });
    }
}

export class GetAllQuestions {
    static item() {
        return new Item({
            name: `Get All Questions`,
            description: `API to get all questions. Requires authentication. Supports filtering via query params (e.g., ?type=SINGLE_CHOICE).`,
            request: {
                header: [
                    { key: "Accept", value: "application/json" },
                    { key: "Authorization", value: "Bearer {{accessToken}}" }
                ],
                url: "{{baseUrl}}/question",
                method: 'GET',
            },
        });
    }
}

export class DeleteQuestion {
    static item(id: string = "{{questionId}}") {
        return new Item({
            name: `Delete Question`,
            description: `API to delete a question. Requires authentication.`,
            request: {
                header: [
                    { key: "Authorization", value: "Bearer {{accessToken}}" }
                ],
                url: `{{baseUrl}}/question/${id}`,
                method: 'DELETE',
            },
        });
    }
}

export class GetQuestionTypes {
    static item() {
        return new Item({
            name: `Get Question Types`,
            description: `API to get all available question types. Requires authentication.`,
            request: {
                header: [
                    { key: "Accept", value: "application/json" },
                    { key: "Authorization", value: "Bearer {{accessToken}}" }
                ],
                url: "{{baseUrl}}/question/question-types",
                method: 'GET',
            },
        });
    }
}

export class QuestionHealthCheck {
    static item() {
        return new Item({
            name: `Question Health Check`,
            description: `Check if the Question service is running and healthy. No authentication required.`,
            request: {
                header: [],
                url: "{{baseUrl}}/question/health",
                method: 'GET',
            },
        });
    }
}

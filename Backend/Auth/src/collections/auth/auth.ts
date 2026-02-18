import { Item } from 'postman-collection';

export class AuthHealthCheck {
    static item() {
        return new Item({
            name: `Auth Health Check`,
            description: `Check if the Auth service is running and healthy.`,
            request: {
                header: [],
                url: "{{BASE_URL}}/auth/healthz",
                method: 'GET',
            },
        });
    }
}

export class Signup {
    static item() {
        return new Item({
            name: `Signup`,
            description: `Register a new user.`,
            request: {
                header: [
                    { key: "Content-Type", value: "application/json" }
                ],
                url: "{{BASE_URL}}/auth/user/signup",
                method: 'POST',
                body: {
                    mode: 'raw',
                    raw: JSON.stringify({
                        email: "user@example.com",
                        password: "password123",
                        firstName: "John",
                        lastName: "Doe",
                        phone: "+2348012345678"
                    }, null, 2),
                },
            },
        });
    }
}

export class Signin {
    static item() {
        return new Item({
            name: `Signin`,
            description: `Login with email and password to receive a JWT token.`,
            events: [
                {
                    listen: "test",
                    script: {
                        exec: [
                            "var jsonData = pm.response.json();",
                            "if (jsonData.success && jsonData.data && jsonData.data.token) {",
                            "    pm.collectionVariables.set(\"token\", jsonData.data.token);",
                            "    console.log(\"Token updated successfully\");",
                            "}"
                        ],
                        type: "text/javascript"
                    }
                }
            ],
            request: {
                header: [
                    { key: "Content-Type", value: "application/json" }
                ],
                url: "{{BASE_URL}}/auth/user/signin",
                method: 'POST',
                body: {
                    mode: 'raw',
                    raw: JSON.stringify({
                        email: "user@example.com",
                        password: "password123"
                    }, null, 2),
                },
            },
        });
    }
}

export class Set2FA {
    static item() {
        return new Item({
            name: `Set 2FA`,
            description: `Enable 2-Factor Authentication for the user. Requires authentication.`,
            request: {
                header: [
                    { key: "Content-Type", value: "application/json" },
                    { key: "Authorization", value: "Bearer {{token}}" }
                ],
                url: "{{BASE_URL}}/auth/user/set-2FA",
                method: 'POST',
                body: {
                    mode: 'raw',
                    raw: JSON.stringify({
                        enabled: true
                    }, null, 2),
                },
            },
        });
    }
}

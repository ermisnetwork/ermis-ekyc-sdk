---
sidebar_position: 2
---

# ErmisService

The `ErmisService` provides management APIs for authentication, customer management, appraiser management, and appraisal sessions. It uses **Bearer token authentication**.

## Initialization

```typescript
import { ErmisService } from "ermis-ekyc-sdk";

const ermis = ErmisService.getInstance({
  baseUrl: "https://api-ekyc.ermis.network",
  timeout: 30000, // optional, default: 30000ms
});
```

## Authentication (`ermis.auth`)

| Method                                               | Description                 |
| ---------------------------------------------------- | --------------------------- |
| `login({ username, password })`                      | Login, returns access token |
| `register({ email, password, firstName, lastName })` | Register new account        |
| `logout()`                                           | Clear client-side token     |

### Login

```typescript
const auth = await ermis.auth.login({
  username: "admin",
  password: "password",
});

// Set the token for subsequent requests
ermis.setToken(auth.access_token);

console.log(auth.user); // User object
console.log(auth.access_token); // JWT token
```

### Register

```typescript
const auth = await ermis.auth.register({
  email: "user@example.com",
  password: "secure-password",
  firstName: "Nguyen",
  lastName: "Van A",
});
```

## Customer Management (`ermis.customers`)

| Method                     | Description                         |
| -------------------------- | ----------------------------------- |
| `getCustomers()`           | List all customers with pagination  |
| `getCustomerById(id)`      | Get customer details                |
| `createCustomer(data)`     | Create customer with ID card images |
| `updateCustomer(id, data)` | Update customer                     |

### Create Customer

```typescript
const customer = await ermis.customers.createCustomer({
  fullName: "Nguyen Van A",
  dateOfBirth: "1990-01-15",
  identityNumber: "012345678901",
  placeOfOrigin: "Ha Noi",
  issueDate: "2020-01-01",
  issuePlace: "Cuc CS QLHC",
  phoneNumber: "0901234567",
  address: "123 ABC, Ha Noi",
  occupation: "Engineer",
  monthlyIncome: 20000000,
  loanAmount: 100000000,
  loanTerm: 12,
  frontIdImage: frontFile, // File object
  backIdImage: backFile, // File object
});
```

### Customer Statuses

| Status        | Description              |
| ------------- | ------------------------ |
| `PENDING`     | Waiting for verification |
| `IN_PROGRESS` | Verification in progress |
| `APPROVED`    | Verification passed      |
| `REJECTED`    | Verification failed      |

## Appraiser Management (`ermis.appraisers`)

| Method                  | Description                         |
| ----------------------- | ----------------------------------- |
| `getAppraisers()`       | List all appraisers with pagination |
| `createAppraiser(data)` | Create new appraiser                |

### Create Appraiser

```typescript
const appraiser = await ermis.appraisers.createAppraiser({
  firstName: "Tran",
  lastName: "Thi B",
  email: "appraiser@example.com",
  phoneNumber: "0987654321",
  location: "Ho Chi Minh",
});
```

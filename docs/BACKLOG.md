# Backlog

## High Priority

### Authentication

#### MVP

- [ ] Register
- [ ] Login
- [ ] Refresh
- [ ] Logout
- [ ] Forgot password
- [ ] Reset password

#### Technical Improvement

- [ ] Fix import problem after updating api-contracts package.json and tsconfig.json
- [ ] Refactor API response for ConflictError to include errors field
- [ ] Add 429 Too Many Request response for forgot password Openapi documentation
- [ ] Add retry after in the TooManyRequest error

---

### Category

#### MVP

- [ ] CRUD Category
- [ ] Search Categories
- [ ] Sort Transaction
- [ ] Pagination Transaction

#### Bugs

- [ ] Deleting a category used by transactions results in a conflict error
- [ ] Editing category type after transactions exist causes reporting inconsistencies
- [ ] User can create duplicate categories

---

## Medium Priority

### Transaction

#### MVP

- [ ] CRUD Transaction

#### Enhancements

- [ ] Search transaction by name or description
- [ ] Sort transaction by date
- [ ] Sort transaction by amount
- [ ] Filter transaction by category
- [ ] Export transaction CSV

### Dashboard

#### MVP

- [ ] Balance summary
- [ ] Income summary
- [ ] Expense summary

#### Enhancements

- [ ] Monthly chart

---

## Low Priority

### Other Features

- [ ] User profile
- [ ] Dark mode

# Ideas

- [] Multi-currency

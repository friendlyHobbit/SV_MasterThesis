
# libraries
library(ggplot2)

# Settings
n <- 50

# uniform distribution
uni_distr <- runif(n, 0, 1)

# normal distribution
norm_distr <- rnorm(n, mean=1, sd=1)

# binomial distribution
binom_distr <- rbinom(n, size, prob)

distrDF <- merge(uni_distr)

# dot plot
ggplot(uni_distr)

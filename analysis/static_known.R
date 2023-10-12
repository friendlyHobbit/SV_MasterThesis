##### libraries ####
library(ggplot2)
library(ggpubr)
library(dplyr)
library(tidyr)
library(readr)
library(stringr)
library(gridExtra)
library(rstatix)


##### Import data ############################

# location of files - Sita´s personal pc
data_dir <- "C:\\Git\\SV_MasterThesis\\data"
# location of files - Sita´s job pc

all_data_df <- read_csv(file.path(data_dir, "results_8_32_72.csv"))
summary(all_data_df)




##### Subset relevant data only - static known ################

data_static_df <- all_data_df[all_data_df$is_dynamic == FALSE & all_data_df$test_phase == "performanceA", ]
summary(data_static_df)

# remove empty rows
data_static_df <- data_static_df[rowSums(is.na(data_static_df)) != ncol(data_static_df), ]

# subset data 32 and 8
data_static_32_8_df <- data_static_df[data_static_df$number_of_charts != 72, ]

# check the data
check_df = subset(data_static_32_8_df, select = c(chart_type,participant_answer_state,unique_chart_state,accuracy) )

summary(check_df)

# Data formatting 
# List of column names to convert to factors
columns_to_convert <- c("id", "participant_id", "computer_uuid", "chart_type", "data_source", 
                        "test_phase", "session_index", "session_type", "number_of_charts", "unique_chart_index",
                        "unique_chart_state", "participant_answer_index", "participant_answer_state")

data_static_df[,columns_to_convert] <- lapply(data_static_df[,columns_to_convert] , factor)
data_static_32_8_df[,columns_to_convert] <- lapply(data_static_32_8_df[,columns_to_convert] , factor)

summary(data_static_df)
summary(data_static_32_8_df)



##### Descriptive statistics - accuracy ##########################

# check the data
check_df = subset(data_static_32_8_df, select = c(chart_type,participant_answer_index,unique_chart_index,accuracy) )


summary(data_static_32_8_df$accuracy)

accuracy_table <- table(data_static_32_8_df$chart_type, data_static_32_8_df$accuracy, group=data_static_32_8_df$number_of_charts)
accuracy_table


# aggregate per person, per display type, per number_charts, per accuracy
agg_accuracy_ID <- data_static_32_8_df %>%
  group_by(participant_id, chart_type, number_of_charts, accuracy) %>%
  summarize(frequency=n(), accuracy_proportion=n()/4) %>%
  filter(accuracy == TRUE)


# accuracy per chart_type, number_of_charts
agg_accuracy_tot <- data_static_32_8_df %>%
  group_by(chart_type, number_of_charts, accuracy) %>%
  summarize(frequency=n(), accuracy_proportion=n()/40) %>%
  filter(accuracy == TRUE)

# plot
ggplot(data = data_static_32_8_df, aes(x = accuracy)) +
  geom_bar(position = 'dodge') +
  facet_grid(number_of_charts ~ chart_type) +
  labs(x = "TRUE = accurate",  
       fill = " ",  
       y = "Accuracy cound",  
       title = " ") 





##### Descriptive statistics - RT #####################

# remove inaccurate data points
data_static_32_8_df<-data_static_32_8_df[data_static_32_8_df$accuracy==TRUE,]

summary(data_static_32_8_df$RT)

# aggregate so there is 1 value per person
agg_32_8 <- data_static_32_8_df %>%
  group_by(participant_id, chart_type, number_of_charts) %>%
  summarize(rt_mean=mean(RT), rt_median=median(RT), frequency=n())

agg_median_32_8 <- agg_32_8 %>%
  group_by(chart_type, number_of_charts) %>%
  summarize(frequency=n(), rt_m=median(rt_median))


# plot results
RT_boxplot <- ggplot(agg_32_8, aes(y = rt_median)) +
  geom_boxplot(fill = "blue", alpha = 0.5) +  
  facet_grid(chart_type ~ number_of_charts, scales = "free_x") +
  labs(y = "RT median") +  
  theme_minimal()  
print(RT_boxplot)



##### Stats check - RT ##########################

# check normality - not normal
rt_shapiro_results <- data_static_32_8_df %>%
  group_by(number_of_charts, chart_type) %>%
  summarize(
    Shapiro_Wilk_p_value = shapiro.test(RT)$p.value
  )
print(rt_shapiro_results)

ggdensity(data_static_32_8_df$RT)
hist(data_static_32_8_df$RT)
boxplot(data_static_32_8_df$RT)

# distributions 
density_plots <- ggplot(data_static_32_8_df, aes(x = RT)) +
  geom_density(fill = "blue", alpha = 0.5) +  
  facet_grid(chart_type ~ number_of_charts, scales = "free_x") +
  labs(x = "RT", y = "Density") + 
  theme_minimal() 
print(density_plots)


# apply log transform
data_static_32_8_df$RT_log <- log(data_static_32_8_df$RT)

# check normality log - normal!
rt_shapiro_results <- data_static_32_8_df %>%
  group_by(number_of_charts, chart_type) %>%
  summarize(
    Shapiro_Wilk_p_value = shapiro.test(RT_log)$p.value
  )
print(rt_shapiro_results)

ggdensity(data_static_32_8_df$RT_log)
hist(data_static_32_8_df$RT_log)
boxplot(data_static_32_8_df$RT_log)

# distributions 
density_plots <- ggplot(data_static_32_8_df, aes(x = RT_log)) +
  geom_density(fill = "blue", alpha = 0.5) +  
  facet_grid(chart_type ~ number_of_charts, scales = "free_x") +
  labs(x = "RT_log", y = "Density") + 
  theme_minimal() 
print(density_plots)




##### Stats - RT ##########################

agg_rt_log <- data_static_32_8_df %>%
  group_by(participant_id, chart_type, number_of_charts) %>%
  summarize(rt_mean=mean(RT), rt_log_mean=mean(RT_log), frequency=n())

agg_rt_log <- ungroup(agg_rt_log)

# repeated measures ANOVA: chart_type*number_of_charts (3b*2w)
aov_static <- anova_test(data = agg_rt_log, 
                         dv = rt_log_mean, 
                         wid = participant_id, 
                         between = chart_type,
                         within = number_of_charts,
                         effect.size = "pes")
get_anova_table(aov_static, correction = "auto")


# Pairwise comparisons 
rt_pwc <- agg_rt_log %>%
  group_by(number_of_charts) %>%
  pairwise_t_test(
    rt_log_mean ~ chart_type, paired = TRUE,  detailed = TRUE,
    p.adjust.method = "bonferroni"
  )
rt_pwc

# plot
bxp <- ggboxplot(
  agg_rt_log, x = "chart_type", y = "rt_log_mean",
  color = "number_of_charts", palette = "jco"
)
bxp

rt_pwc <- rt_pwc %>% add_xy_position(x = "chart_type")
bxp + 
  stat_pvalue_manual(rt_pwc, tip.length = 0, hide.ns = TRUE) +
  labs(
    subtitle = get_test_label(aov_static, detailed = TRUE),
    caption = get_pwc_label(rt_pwc)
  )

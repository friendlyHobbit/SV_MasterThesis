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



##### Subset dynamic 8, 32, 72 #######################

data_dynamic_df <- all_data_df[all_data_df$is_dynamic == TRUE &
                               (all_data_df$test_phase == "performanceB" |
                                  all_data_df$test_phase == "performanceA") ,] 

# remove empty rows
data_dynamic_df <- data_dynamic_df[rowSums(is.na(data_dynamic_df)) != ncol(data_dynamic_df), ]

summary(data_dynamic_df)




##### Calculate new variables ###################

# accuracy
data_dynamic_df$accuracy = ifelse(data_dynamic_df$participant_answer_index == data_dynamic_df$unique_chart_index, TRUE, FALSE) 

# reaction time
data_dynamic_df$transition_after_corr <- (data_dynamic_df$transition_after-1)*5000
data_dynamic_df$RT_dynamic <- data_dynamic_df$trigger_time - (data_dynamic_df$session_index + data_dynamic_df$transition_after_corr)  

# log tranform rt
data_dynamic_df$RT_dynamic_log <- log(data_dynamic_df$RT_dynamic)



##### Data formatting ##################################

columns_to_convert <- c("id", "participant_id", "computer_uuid", "chart_type", "data_source", 
                        "test_phase", "session_index", "session_type", "number_of_charts", "unique_chart_index",
                        "unique_chart_state", "participant_answer_index", "participant_answer_state")

data_dynamic_df[,columns_to_convert] <- lapply(data_dynamic_df[,columns_to_convert] , factor)

summary(data_dynamic_df)





##### Accuracy descriptives ############################

# aggregate per person, per display type, per number_charts, per accuracy
agg_accuracy_ID <- data_dynamic_df %>%
  group_by(participant_id, chart_type, number_of_charts, test_phase, accuracy) %>%
  summarize(frequency=n(), accuracy_proportion=n()/4) %>%
  filter(accuracy == TRUE)

# accuracy per chart_type, number_of_charts
agg_accuracy_tot <- data_dynamic_df %>%
  group_by(chart_type, number_of_charts, test_phase, accuracy) %>%
  summarize(frequency=n(), accuracy_proportion=n()/40) %>%
  filter(accuracy == TRUE)

# plot accuracy count
ggplot(data = data_dynamic_df, aes(x = accuracy, fill=number_of_charts)) +
  geom_bar(position = 'dodge') +
  facet_grid(test_phase ~ chart_type) +
  labs(x = "TRUE = accurate",  
       fill = " ",  
       y = "Accuracy frequency",  
       title = " ") 




##### RT - check normality #######################

# only take accurate cases
data_dynamic_RT_df <- data_dynamic_df[data_dynamic_df$accuracy==TRUE,]
data_dynamic_RT_df <- data_dynamic_df


summary(data_dynamic_RT_df)


# test normality 
shapiro_results <- data_dynamic_RT_df %>%
  group_by(chart_type, number_of_charts, test_phase) %>%
  summarize(
    Shapiro_Wilk_p_value = shapiro.test(RT_dynamic)$p.value
  )
print(shapiro_results)

# distributions 
density_plots <- ggplot(data_dynamic_RT_df, aes(x = RT_dynamic)) +
  geom_density(fill = "blue", alpha = 0.5) +  
  facet_grid(chart_type ~ number_of_charts ~ test_phase , scales = "free_x") +
  labs(x = "RT_static_log", y = "Density") + 
  theme_minimal() 
print(density_plots)


# test normality log
shapiro_results_log <- data_dynamic_RT_df %>%
  group_by(chart_type, number_of_charts, test_phase) %>%
  summarize(
    Shapiro_Wilk_p_value = shapiro.test(RT_dynamic_log)$p.value
  )
print(shapiro_results_log)

# distributions log
density_plots_log <- ggplot(data_dynamic_RT_df, aes(x = RT_dynamic_log)) +
  geom_density(fill = "blue", alpha = 0.5) +  
  facet_grid(chart_type ~ number_of_charts ~ test_phase , scales = "free_x") +
  labs(x = "RT_static_log", y = "Density") + 
  theme_minimal() 
print(density_plots_log)




##### RT - descriptives ####################

# check outliers
rt_outliers <- data_dynamic_RT_df %>%
  group_by(chart_type, number_of_charts, test_phase) %>%
  identify_outliers(RT_dynamic_log)


# aggregate per person, per display type, per number_charts
agg_RT_ID <- data_dynamic_RT_df %>%
  group_by(participant_id, chart_type, number_of_charts, test_phase) %>%
  summarize(freq=n(), 
            rt_median=median(RT_dynamic), rt_mean=mean(RT_dynamic), 
            rt_log_median=median(RT_dynamic_log), rt_log_mean=mean(RT_dynamic_log))

# accuracy per chart_type, number_of_charts
agg_RT_tot <- data_dynamic_RT_df %>%
  group_by(chart_type, number_of_charts, test_phase) %>%
  summarize(freq=n(),
            mean_rt = mean(RT_dynamic),
            median_rt = median(RT_dynamic),
            SD_rt = sd(RT_dynamic),
            min_rt = min(RT_dynamic),
            max_rt = max(RT_dynamic),
            mean_rt_log = mean(RT_dynamic_log),
            median_rt_log = median(RT_dynamic_log),
            SD_rt_log = sd(RT_dynamic_log),
            min_rt_log = min(RT_dynamic_log),
            max_rt_log = max(RT_dynamic_log)
  )

# boxplots
bxp_RT_log_dynamic <- ggplot(data_dynamic_RT_df, aes(y = RT_dynamic_log, fill = test_phase)) +
  geom_boxplot() +  
  facet_grid(chart_type ~ number_of_charts, scales = "free_x") +
  labs(y = "RT dynamic log") +  
  theme_minimal()  
print(bxp_RT_log_dynamic)

bxp_RT_dynamic <- ggplot(data_dynamic_RT_df, aes(y = RT_dynamic, fill = test_phase)) +
  geom_boxplot() +  
  facet_grid(chart_type ~ number_of_charts, scales = "free_x") +
  labs(y = "RT_dynamic") +  
  theme_minimal()  
print(bxp_RT_dynamic)

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



##### Calculate new variables ###################

# accuracy
all_data_df$accuracy = ifelse(all_data_df$participant_answer_index == all_data_df$unique_chart_index, TRUE, FALSE) 

# reaction time
all_data_df$RT_static <- all_data_df$trigger_time - all_data_df$user_ready_time  

# log tranform rt
all_data_df$RT_static_log <- log(all_data_df$RT_static)




##### Data formatting ##################################

columns_to_convert <- c("id", "participant_id", "computer_uuid", "chart_type", "data_source", 
                        "test_phase", "session_index", "session_type", "number_of_charts", "unique_chart_index",
                        "unique_chart_state", "participant_answer_index", "participant_answer_state")

all_data_df[,columns_to_convert] <- lapply(all_data_df[,columns_to_convert] , factor)




##### Subset static 8, 32, 72 #######################

data_known_df <- all_data_df[all_data_df$is_dynamic == FALSE &
                               (all_data_df$test_phase == "performanceB" |
                                  all_data_df$test_phase == "performanceA") ,] 

# remove empty rows
data_known_df <- data_known_df[rowSums(is.na(data_known_df)) != ncol(data_known_df), ]

summary(data_known_df)



##### Accuracy descriptives ############################

# aggregate per person, per display type, per number_charts, per accuracy
agg_accuracy_ID <- data_known_df %>%
  group_by(participant_id, chart_type, number_of_charts, test_phase, accuracy) %>%
  summarize(frequency=n(), accuracy_proportion=n()/4) %>%
  filter(accuracy == TRUE)

# accuracy per chart_type, number_of_charts
agg_accuracy_tot <- data_known_df %>%
  group_by(chart_type, number_of_charts, test_phase, accuracy) %>%
  summarize(frequency=n(), accuracy_proportion=n()/40) %>%
  filter(accuracy == TRUE)

# plot accuracy count
ggplot(data = data_known_df, aes(x = accuracy, fill=test_phase)) +
  geom_bar(position = 'dodge') +
  facet_grid(number_of_charts ~ chart_type) +
  labs(x = "TRUE = accurate",  
       fill = " ",  
       y = "Accuracy frequency",  
       title = " ") 





##### RT - descriptives ####################

# only take accurate cases
data_known_RT_df <- data_known_df[data_known_df$accuracy==TRUE,]


# check outliers
rt_outliers <- data_known_RT_df %>%
  group_by(chart_type, number_of_charts, test_phase) %>%
  identify_outliers(RT_static_log)

# remove extreme
data_known_RT_df <- data_known_RT_df[!(data_known_RT_df$RT_static_log  %in% rt_outliers$RT_static_log ),]


# aggregate per person, per display type, per number_charts
agg_RT_ID <- data_known_RT_df %>%
  group_by(participant_id, chart_type, number_of_charts, test_phase) %>%
  summarize(freq=n(), 
            rt_median=median(RT_static), rt_mean=mean(RT_static), 
            rt_log_median=median(RT_static_log), rt_log_mean=mean(RT_static_log))

# accuracy per chart_type, number_of_charts
agg_RT_tot <- data_known_RT_df %>%
  group_by(chart_type, number_of_charts, test_phase) %>%
  summarize(freq=n(),
            mean_rt = mean(RT_static),
            median_rt = median(RT_static),
            SD_rt = sd(RT_static),
            min_rt = min(RT_static),
            max_rt = max(RT_static),
            mean_rt_log = mean(RT_static_log),
            median_rt_log = median(RT_static_log),
            SD_rt_log = sd(RT_static_log),
            min_rt_log = min(RT_static_log),
            max_rt_log = max(RT_static_log)
            )


# boxplots
bxp_RT_log_static <- ggplot(data_known_RT_df, aes(y = RT_static_log, fill = test_phase)) +
  geom_boxplot() +  
  facet_grid(chart_type ~ number_of_charts, scales = "free_x") +
  labs(y = "RT_static_log") +  
  theme_minimal()  
print(bxp_RT_log_static)

bxp_RT_static <- ggplot(data_known_RT_df, aes(y = RT_static, fill = test_phase)) +
  geom_boxplot() +  
  facet_grid(chart_type ~ number_of_charts, scales = "free_x") +
  labs(y = "RT_static_log") +  
  theme_minimal()  
print(bxp_RT_static)



##### RT - check normality #######################

# test normality 
shapiro_results <- data_known_RT_df %>%
  group_by(chart_type, number_of_charts, test_phase) %>%
  summarize(
    Shapiro_Wilk_p_value = shapiro.test(RT_static)$p.value
  )
print(shapiro_results)

# test normality log
shapiro_results <- data_known_RT_df %>%
  group_by(chart_type, number_of_charts, test_phase) %>%
  summarize(
    Shapiro_Wilk_p_value = shapiro.test(RT_static_log)$p.value
  )
print(shapiro_results)

# distributions log
density_plots <- ggplot(data_known_RT_df, aes(x = RT_static_log)) +
  geom_density(fill = "blue", alpha = 0.5) +  
  facet_grid(chart_type ~ number_of_charts ~ test_phase , scales = "free_x") +
  labs(x = "RT_static_log", y = "Density") + 
  theme_minimal() 
print(density_plots)


##### RT - ANOVA 3b*3w*2w ##########################

agg_RT_ID <- ungroup(agg_RT_ID)

# repeated measures ANOVA
aov_static <- anova_test(data = agg_RT_ID, 
                         dv = rt_log_mean, 
                         wid = participant_id, 
                         between = chart_type,
                         within = c(number_of_charts, test_phase),
                         effect.size = "pes")
get_anova_table(aov_static, correction = "auto")

# Interaction effect


# Pairwise comparisons 
rt_pwc <- agg_RT_ID %>%
  group_by(number_of_charts, test_phase) %>%
  pairwise_t_test(
    rt_log_mean ~ chart_type, paired = TRUE,  detailed = TRUE,
    p.adjust.method = "bonferroni"
  )
rt_pwc


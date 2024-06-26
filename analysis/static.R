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

data_dir <- "C:\\Git\\SV_MasterThesis\\data"

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



##### Subset static #######################

data_static_df <- all_data_df[all_data_df$is_dynamic == FALSE &
                                  (all_data_df$test_phase == "performanceB" |
                                  all_data_df$test_phase == "performanceA") ,] 

# remove empty rows
data_static_df <- data_static_df[rowSums(is.na(data_static_df)) != ncol(data_static_df), ]

summary(data_static_df)




##### Accuracy descriptives ############################

# nice lables
data_static_df$chart_type <- factor(data_static_df$chart_type, levels = c("eid", "ibc", "ibq"), 
                                    labels = c("CCD", "ID4", "ID1"))

data_static_df$test_phase <- factor(data_static_df$test_phase, levels = c("performanceA", "performanceB"),
                                    labels = c("state known", "state unknown"))

data_static_df$accuracy <- factor(data_static_df$accuracy, levels = c(TRUE, FALSE),
                                  labels = c("correct", "incorrect"))

# aggregate per person, per display type, per dynamic, per number_charts, per accuracy
agg_accuracy_ID <- data_static_df %>%
  group_by(participant_id, chart_type, number_of_charts, test_phase, accuracy) %>%
  summarize(frequency=n(), accuracy_proportion=n()/4) %>%
  filter(accuracy == "correct")

# accuracy per chart_type, number_of_charts
agg_accuracy_tot <- data_static_df %>%
  group_by(chart_type, number_of_charts, test_phase, accuracy) %>%
  summarize(frequency=n(), accuracy_proportion=n()/40) %>%
  filter(accuracy == "correct")


# bar plot accuracy
ggplot(data = data_static_df, aes(x = test_phase, fill=accuracy)) +
  geom_bar(position = 'fill') +
  facet_grid(number_of_charts ~ chart_type) +
  labs(x = "Test phase",  
       fill = "Accuracy",  
       y = "proportion",  
       title = " ") +
  theme(axis.text.x = element_text(angle = 45, hjust=1, vjust=1))




##### RT - prepare and check the data ####################

# only take accurate cases
data_static_RT_df <- data_static_df[data_static_df$accuracy==TRUE,]

# check outliers
rt_outliers <- data_static_df %>%
  group_by(chart_type, number_of_charts, test_phase) %>%
  identify_outliers(RT_static)
rt_outliers

# remove the outliers
data_static_clean_df <- data_static_RT_df[!(data_static_RT_df$RT_static  %in% rt_outliers$RT_static),]




# one RT value per person per display and N_charts
# aggregate per person, per display type, per number_charts
agg_RT_ID <- data_static_clean_df %>%
  group_by(participant_id, chart_type, number_of_charts, test_phase) %>%
  summarize(freq=n(), rt_median=median(RT_static), rt_mean=mean(RT_static))

# check number of data points per participant
agg_agg_RT_ID <- agg_RT_ID %>%
  group_by(participant_id) %>%
  summarize(freq=n())



# test normality 
shapiro_results <- agg_RT_ID %>%
  group_by(chart_type, number_of_charts, test_phase) %>%
  summarize(
    Shapiro_Wilk_p_value = shapiro.test(rt_mean)$p.value,
    #Shapiro_Wilk_p_value_log = shapiro.test(rt_mean_log)$p.value
  )
print(shapiro_results)

# distributions 
density_plots <- ggplot(agg_RT_ID, aes(x = rt_mean)) +
  geom_density(fill = "blue", alpha = 0.5) +  
  facet_grid(chart_type ~ number_of_charts ~ test_phase , scales = "free_x") +
  labs(x = "RT_static_log", y = "Density") + 
  theme_minimal() 
print(density_plots)



# RT per chart_type, number_of_charts
agg_RT_tot <- agg_RT_ID %>%
  group_by(chart_type, number_of_charts, test_phase) %>%
  summarize(freq=n(),
            mean_rt = mean(rt_mean),
            median_rt = median(rt_mean),
            SD_rt = sd(rt_mean),
            min_rt = min(rt_mean),
            max_rt = max(rt_mean)
            )


# boxplots
bxp_RT_static <- ggplot(agg_RT_ID, aes(y = rt_mean, fill = test_phase)) +
  geom_boxplot() +  
  facet_grid(chart_type ~ number_of_charts, scales = "free_x") +
  labs(y = "RT_static_log") +  
  theme_minimal()  
print(bxp_RT_static)






##### RT - ANOVA 3b*3w*2w ##########################

# check number of cases per conditions
agg_check_observations <- agg_RT_ID %>%
  group_by(number_of_charts, test_phase, chart_type) %>%
  summarize(freq=n())


agg_RT_ID <- ungroup(agg_RT_ID)

# repeated measures ANOVA
aov_static <- anova_test(data = agg_RT_ID, 
                         dv = rt_mean, 
                         wid = participant_id, 
                         between = chart_type,
                         within = c(number_of_charts, test_phase),
                         effect.size = "pes")
get_anova_table(aov_static, correction = "auto")


# Two way at chart_type level
rt_twoway <- agg_RT_ID %>%
  group_by(chart_type) %>%
  anova_test(dv = rt_mean, wid = participant_id, within = c(number_of_charts, test_phase)) %>%
  get_anova_table() %>%
  adjust_pvalue(method = "BH")
rt_twoway
get_anova_table(rt_twoway, correction = "auto")


# Effect of number_of_charts at chart_type X test_phase
rt_effect <- agg_RT_ID %>%
  group_by(chart_type, test_phase) %>%
  anova_test(dv = rt_mean, wid = participant_id, within = number_of_charts)
rt_effect
get_anova_table(rt_effect, correction = "auto")

# Effect of test_phase at chart_type X number_of_charts
rt_effect <- agg_RT_ID %>%
  group_by(chart_type, number_of_charts) %>%
  anova_test(dv = rt_mean, wid = participant_id, within = test_phase)
rt_effect
get_anova_table(rt_effect, correction = "auto")

# Effect of chart_type at test_phase X number_of_charts
rt_effect <- agg_RT_ID %>%
  group_by(test_phase, number_of_charts) %>%
  anova_test(dv = rt_mean, wid = participant_id, within = chart_type)
rt_effect
get_anova_table(rt_effect, correction = "auto")


# Pairwise comparisons 
rt_pwc <- agg_RT_ID %>%
  group_by(number_of_charts, test_phase) %>%
  pairwise_t_test(
    rt_mean ~ chart_type, paired = TRUE,  detailed = TRUE,
    p.adjust.method = "BH"
  )
rt_pwc


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

# location of files - Add file path of data here
data_dir <- ""


all_data_df <- read_csv(file.path(data_dir, "results_8_32_72.csv"))
summary(all_data_df)



##### Subset dynamic 8, 32, 72 #######################

dynamic_known_df <- all_data_df[all_data_df$is_dynamic == TRUE &
                                  all_data_df$test_phase == "performanceA" ,] 

# remove empty rows
dynamic_known_df <- dynamic_known_df[rowSums(is.na(dynamic_known_df)) != ncol(dynamic_known_df), ]

summary(dynamic_known_df)




##### Calculate new variables ###################

# accuracy
dynamic_known_df$accuracy = ifelse(dynamic_known_df$participant_answer_index == dynamic_known_df$unique_chart_index, TRUE, FALSE) 

# reaction time
dynamic_known_df$RT_dynamic <- (dynamic_known_df$trigger_time - dynamic_known_df$session_start_time) - (dynamic_known_df$transition_after*1000)




##### Data formatting ##################################

columns_to_convert <- c("id", "participant_id", "computer_uuid", "chart_type", "data_source", 
                        "test_phase", "session_index", "session_type", "number_of_charts", "unique_chart_index",
                        "unique_chart_state", "participant_answer_index", "participant_answer_state")

dynamic_known_df[,columns_to_convert] <- lapply(dynamic_known_df[,columns_to_convert] , factor)

summary(dynamic_known_df)


# nice lables
dynamic_known_df$chart_type <- factor(dynamic_known_df$chart_type, levels = c("eid", "ibc", "ibq"), 
                                          labels = c("CCD", "ID4", "ID1"))

dynamic_known_df$test_phase <- factor(dynamic_known_df$test_phase, levels = c("performanceA", "performanceB"),
                                          labels = c("state known", "state unknown"))

dynamic_known_df$accuracy <- factor(dynamic_known_df$accuracy, levels = c(FALSE, TRUE),
                                        labels = c("incorrect", "correct"))




##### Check data and fix it #################################

# get mean and median for each condition
RTperCondition_df <- dynamic_known_df %>%
  group_by(chart_type, number_of_charts) %>%
  summarise(frequency=n(), rt_median=median(RT_dynamic), rt_mean=mean(RT_dynamic))

# check if participant has missing data
check_ID_df <- dynamic_known_df %>%
  group_by(participant_id) %>%
  summarise(frequency=n())

# get participant with freq less than 12
participant_id <- check_ID_df$participant_id[check_ID_df$frequency < 12 ]

# get missing chart_type and number (frequency less than 40)
chart_type <- RTperCondition_df$chart_type[RTperCondition_df$frequency < 40]
number_of_charts <- RTperCondition_df$number_of_charts[RTperCondition_df$frequency < 40]


# add missing
RT_dynamic <- NA

# create new temp df
column_names <- colnames(dynamic_known_df)
temp_df <- data.frame(matrix(ncol = length(column_names), nrow = 4))
colnames(temp_df) <- column_names

temp_df$participant_id <- c(participant_id, participant_id, participant_id, participant_id)
temp_df$chart_type <- c(chart_type, chart_type, chart_type, chart_type)
temp_df$number_of_charts <- c(number_of_charts, number_of_charts, number_of_charts, number_of_charts)
temp_df$RT_dynamic <- c(RT_dynamic, RT_dynamic, RT_dynamic, RT_dynamic)
temp_df$test_phase <- c("state known", "state known", "state known", "state known")


# add missing data back into df
dynamic_known_df <- rbind(dynamic_known_df, temp_df)




##### Accuracy descriptives ############################

# aggregate per person, per display type, per number_charts, per accuracy
agg_accuracy_ID <- dynamic_known_df %>%
  group_by(participant_id, chart_type, number_of_charts, test_phase, accuracy) %>%
  summarize(frequency=n(), accuracy_proportion=n()/4) 

# accuracy per chart_type, number_of_charts
agg_accuracy_tot <- dynamic_known_df %>%
  group_by(chart_type, number_of_charts, accuracy) %>%
  summarize(frequency=n(), accuracy_proportion=n()/40)
agg_accuracy_tot


# bar plot accuracy
ggplot(data = dynamic_known_df, aes(x = test_phase, fill=accuracy)) +
  geom_bar(position = 'fill') +
  facet_grid(chart_type ~ number_of_charts) +
  labs(x = "",  
       fill = "Accuracy",  
       y = "proportion",  
       title = " ") +
  theme(axis.text.x=element_blank(), 
        axis.ticks.x=element_blank())




##### RT - check and prepare the data #######################

# only take accurate cases
dynamic_known_df <- dynamic_known_df[dynamic_known_df$accuracy=="correct",]


# one RT value per person per display and N_charts
# aggregate per person, per display type, per number_charts
agg_RT_ID <- dynamic_known_df %>%
  group_by(participant_id, chart_type, number_of_charts) %>%
  summarize(freq=n(), rt_median=median(RT_dynamic), rt_mean=mean(RT_dynamic))
# remove empty row
agg_RT_ID <- agg_RT_ID[complete.cases(agg_RT_ID), ]

# check number of data points per participant
agg_agg_RT_ID <- agg_RT_ID %>%
  group_by(participant_id) %>%
  summarize(freq=n())


# try transformations
agg_RT_ID$rt_mean_log <- log(agg_RT_ID$rt_mean)
agg_RT_ID$rt_mean_dev <- (1/agg_RT_ID$rt_mean)


# test normality log
shapiro_results <- agg_RT_ID %>%
  group_by(chart_type, number_of_charts) %>%
  summarize(
    Shapiro_Wilk_p_value = shapiro.test(rt_mean)$p.value,
    Shapiro_Wilk_p_value_log = shapiro.test(rt_mean_log)$p.value,
    Shapiro_Wilk_p_value_dev = shapiro.test(rt_mean_dev)$p.value,
  )
print(shapiro_results)


# distributions 
density_plots <- ggplot(agg_RT_ID, aes(x = rt_mean_dev)) +
  geom_density(fill = "blue", alpha = 0.5) +  
  facet_grid(chart_type ~ number_of_charts , scales = "free_x") +
  labs(x = "RT_static_log", y = "Density") + 
  theme_minimal() 
print(density_plots)


# check outliers
rt_outliers <- agg_RT_ID %>%
  group_by(chart_type, number_of_charts) %>%
  identify_outliers(rt_mean_dev)
rt_outliers

## Use rt_mean_dev, has least extreme outliers, is most normal



##### RT - descriptives ####################

# accuracy per chart_type, number_of_charts
agg_RT_tot <- agg_RT_ID %>%
  group_by(chart_type, number_of_charts) %>%
  summarize(freq=n(),
            mean_rt = mean(rt_mean),
            median_rt = median(rt_mean),
            SD_rt = sd(rt_mean),
            min_rt = min(rt_mean),
            max_rt = max(rt_mean),
            se_rt = SD_rt / sqrt(n()),  # Standard Error
            ci_lower = mean_rt - qt(0.975, df=n()-1) * se_rt,  # Lower 95% CI
            ci_upper = mean_rt + qt(0.975, df=n()-1) * se_rt   # Upper 95% CI
  )


# confidence interfall plot
CL_plot <- ggplot(agg_RT_tot, aes(x=number_of_charts, y=mean_rt, colour=chart_type, group = chart_type)) + 
  geom_errorbar(aes(ymin=ci_lower, ymax=ci_upper), width=.3, position = position_dodge(0.4)) +
  geom_line(position = position_dodge(0.4)) +
  geom_point(position = position_dodge(0.4)) +
  labs(
    x = "Number of Displays",
    y = "Mean RT in msec",
    colour = "Display Type"
  )
CL_plot




##### RT - ANOVA 3b*3w*2w ##########################

summary(agg_RT_ID)

# check number of cases per conditions
agg_check_observations <- agg_RT_ID %>%
  group_by(number_of_charts, chart_type) %>%
  summarize(freq=n())
agg_check_observations

agg_RT_ID <- ungroup(agg_RT_ID)

agg_RT_ID <- agg_RT_ID %>%
  mutate(
    number_of_charts = factor(number_of_charts),
    chart_type = factor(chart_type)
  )

# Check if the dataset is balanced
table(agg_RT_ID$number_of_charts, agg_RT_ID$chart_type)
sum(is.na(agg_RT_ID))


# ANOVA 

# two-way repeated measures anova
res.aov <- anova_test(data = agg_RT_ID, 
                      dv = rt_mean_dev, 
                      wid = participant_id, 
                      within = number_of_charts,
                      between = chart_type)
get_anova_table(res.aov)


# Effect of number_of_charts at each chart_type
one.way <- agg_RT_ID %>%
  group_by(chart_type) %>%
  anova_test(dv = rt_mean_dev, wid = participant_id, within = number_of_charts) %>%
  get_anova_table() %>%
  adjust_pvalue(method = "bonferroni")
one.way

agg_RT_ID$rt_mean_dev <- agg_RT_ID$rt_mean_dev*1e6

# Effect of chart_type at each number_of_charts
one.way <- agg_RT_ID %>%
  group_by(number_of_charts) %>%
  anova_test(dv = rt_mean_dev, wid = participant_id, between = chart_type) %>%
  get_anova_table() %>%
  adjust_pvalue(method = "bonferroni")
one.way


# pairwise 
pwc <- agg_RT_ID %>%
  group_by(number_of_charts) %>%
  t_test(
    rt_mean_dev ~ chart_type, 
    p.adjust.method = "bonferroni",
    detailed = TRUE
  )
pwc












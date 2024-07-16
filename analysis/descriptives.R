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

# location of files 
data_dir <- "C:\\Git\\SV_MasterThesis\\data"


all_data_df <- read_csv(file.path(data_dir, "results_8_32_72.csv"))
summary(all_data_df)



##### Calculate new variables ###################

# accuracy
all_data_df$accuracy = ifelse(all_data_df$participant_answer_index == all_data_df$unique_chart_index, TRUE, FALSE) 

# check the data
check_df = subset(all_data_df, select = c(chart_type,participant_answer_state,unique_chart_state,accuracy) )
# remove empty rows
check_df <- na.omit(check_df)
summary(check_df)


# reaction time
all_data_df$RT_static <- all_data_df$trigger_time - all_data_df$user_ready_time  

# RT dynamic
all_data_df$RT_dynamic <- (all_data_df$trigger_time - all_data_df$session_start_time) - (all_data_df$transition_after*1000)



summary(all_data_df$RT_dynamic)
summary(all_data_df$RT_static)


# merge RT values
all_data_df <- all_data_df %>%
  mutate(RT = coalesce(RT_dynamic, RT_static))

summary(all_data_df)



##### Subset relevant data ###########################

all_data_df <- all_data_df[(all_data_df$is_dynamic == FALSE | all_data_df$is_dynamic == TRUE) &
                           (all_data_df$test_phase == "performanceB" | all_data_df$test_phase == "performanceA") ,] 

# remove empty rows
all_data_df <- all_data_df[rowSums(is.na(all_data_df)) != ncol(all_data_df), ]

summary(all_data_df)
summary(all_data_df$participant_id)




##### Data formatting ##################################

columns_to_convert <- c("id", "participant_id", "computer_uuid", "chart_type", "data_source", 
                        "test_phase", "session_index", "session_type", "number_of_charts", "unique_chart_index",
                        "unique_chart_state", "participant_answer_index", "participant_answer_state")

all_data_df[,columns_to_convert] <- lapply(all_data_df[,columns_to_convert] , factor)

summary(all_data_df)


# nice lables
all_data_df$chart_type <- factor(all_data_df$chart_type, levels = c("eid", "ibc", "ibq"), 
                                            labels = c("CCD", "ID4", "ID1"))

all_data_df$test_phase <- factor(all_data_df$test_phase, levels = c("performanceA", "performanceB"),
                                            labels = c("state known", "state unknown"))

all_data_df$accuracy <- factor(all_data_df$accuracy, levels = c(FALSE, TRUE),
                                          labels = c("incorrect", "correct"))



##### Check data per condition ##################

# get mean and median for each condition
RTperCondition_df <- all_data_df %>%
  group_by(chart_type, number_of_charts) %>%
  summarise(frequency=n(), rt_median=median(RT), rt_mean=mean(RT))
RTperCondition_df

# check which participant has missing data
check_ID_df <- all_data_df %>%
  group_by(participant_id) %>%
  summarise(frequency=n())
check_ID_df


# get participant with freq less than 48
participant_id <- check_ID_df$participant_id[check_ID_df$frequency < 48 ]

# get missing chart_type and number (frequency less than 40)
chart_type <- RTperCondition_df$chart_type[RTperCondition_df$frequency < 160]
number_of_charts <- RTperCondition_df$number_of_charts[RTperCondition_df$frequency < 160]


# impute median of missing condition
RT <- RTperCondition_df$rt_median[RTperCondition_df$frequency < 160]


# create new temp df
column_names <- colnames(all_data_df)
temp_df <- data.frame(matrix(ncol = length(column_names), nrow = 1))
colnames(temp_df) <- column_names

temp_df$participant_id <- c(participant_id)
temp_df$chart_type <- c(chart_type)
temp_df$number_of_charts <- c(number_of_charts)
temp_df$RT <- c(RT)


# add missing data back in 16 times
temp_df_repeated <- bind_rows(replicate(16, temp_df, simplify = FALSE))
all_data_df <- bind_rows(all_data_df, temp_df_repeated)




##### Accuracy descriptives ############################

# aggregate per person, per display type, per dynamic, per number_charts, per accuracy
agg_accuracy_ID <- all_data_df %>%
  group_by(participant_id, chart_type, number_of_charts, accuracy) %>%
  summarize(frequency=n(), accuracy_proportion=n()/16) %>%
  filter(accuracy == "correct")

# accuracy per chart_type, number_of_charts
agg_accuracy_tot <- all_data_df %>%
  group_by(chart_type, number_of_charts, accuracy) %>%
  summarize(frequency=n(), accuracy_proportion=n()/160) %>%
  filter(accuracy == "correct")


# bar plot accuracy
ggplot(data = all_data_df, aes(x = number_of_charts, fill=accuracy)) +
  geom_bar(position = 'fill') +
  facet_grid(chart_type ~.) +
  labs(x = "Test phase",  
       fill = "Accuracy",  
       y = "proportion",  
       title = " ") +
  theme(axis.text.x = element_text(angle = 45, hjust=1, vjust=1))




##### RT - prepare and check the data ####################


# one RT value per person per display and N_charts
# aggregate per person, per display type, per number_charts
agg_RT_ID <- all_data_df %>%
  group_by(participant_id, chart_type, number_of_charts) %>%
  summarize(freq=n(), rt_median=median(RT), rt_mean=mean(RT))

# check number of data points per participant
agg_agg_RT_ID <- agg_RT_ID %>%
  group_by(participant_id) %>%
  summarize(freq=n())


# try transformations
agg_RT_ID$rt_mean_log <- log(agg_RT_ID$rt_mean)
agg_RT_ID$rt_mean_dev <- (1/agg_RT_ID$rt_mean)
agg_RT_ID$rt_median_log <- log(agg_RT_ID$rt_median)
agg_RT_ID$rt_median_dev <- (1/agg_RT_ID$rt_median)


# test normality 
shapiro_results <- agg_RT_ID %>%
  group_by(chart_type, number_of_charts) %>%
  summarize(
    #Shapiro_Wilk_p_value = shapiro.test(rt_mean)$p.value,
    #Shapiro_Wilk_p_value_log = shapiro.test(rt_mean_log)$p.value,
    #Shapiro_Wilk_p_value_dev = shapiro.test(rt_mean_dev)$p.value,
    Shapiro_Wilk_p_value_median = shapiro.test(rt_median)$p.value,
    Shapiro_Wilk_p_value_median_log = shapiro.test(rt_median_log)$p.value,
    Shapiro_Wilk_p_value_median_dev = shapiro.test(rt_median_dev)$p.value
  )
print(shapiro_results)

# distributions 
density_plots <- ggplot(agg_RT_ID, aes(x = rt_median)) +
  geom_density(fill = "blue", alpha = 0.5) +  
  facet_grid(chart_type ~ number_of_charts , scales = "free_x") +
  labs(x = "RT_static_log", y = "Density") + 
  theme_minimal() 
print(density_plots)


# check outliers
rt_outliers <- agg_RT_ID %>%
  group_by(chart_type, number_of_charts) %>%
  identify_outliers(rt_median)
rt_outliers

# use rt_median



##### RT descriptives ############################


# RT per chart_type, number_of_charts
agg_RT_tot <- agg_RT_ID %>%
  group_by(chart_type, number_of_charts) %>%
  summarize(freq=n(),
            mean_rt = mean(rt_median),
            median_rt = median(rt_median),
            SD_rt = sd(rt_median),
            min_rt = min(rt_median),
            max_rt = max(rt_median),
            se_rt = SD_rt / sqrt(n()),  # Standard Error
            ci_lower = mean_rt - qt(0.975, df=n()-1) * se_rt,  # Lower 95% CI
            ci_upper = mean_rt + qt(0.975, df=n()-1) * se_rt   # Upper 95% CI
  )


# confidence interfall plot
CL_RT <- ggplot(agg_RT_tot, aes(x=number_of_charts, y=mean_rt, colour=chart_type, group = chart_type)) + 
  geom_errorbar(aes(ymin=ci_lower, ymax=ci_upper), width=.3, position = position_dodge(0.4)) +
  geom_line(position = position_dodge(0.4)) +
  geom_point(position = position_dodge(0.4)) +
  labs(
    x = "Number of Charts",
    y = "Mean RT in msec",
    colour = "Chart Type"
  )
CL_RT




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
                      dv = rt_median, 
                      wid = participant_id, 
                      within = number_of_charts,
                      between = chart_type)
get_anova_table(res.aov)


# Effect of number_of_charts at each chart_type
one.way <- agg_RT_ID %>%
  group_by(chart_type) %>%
  anova_test(dv = rt_median, wid = participant_id, within = number_of_charts) %>%
  get_anova_table() %>%
  adjust_pvalue(method = "bonferroni")
one.way

# Effect of chart_type at each number_of_charts
one.way <- agg_RT_ID %>%
  group_by(number_of_charts) %>%
  anova_test(dv = rt_median, wid = participant_id, between = chart_type) %>%
  get_anova_table() %>%
  adjust_pvalue(method = "bonferroni")
one.way


# pairwise 
pwc <- agg_RT_ID %>%
  group_by(number_of_charts) %>%
  pairwise_t_test(
    rt_median ~ chart_type, paired = TRUE,
    p.adjust.method = "bonferroni"
  )
pwc








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

# check the data
check_df = subset(exp_data_df, select = c(chart_type,participant_answer_state,unique_chart_state,accuracy) )
# remove empty rows
check_df <- na.omit(check_df)
summary(check_df)


# reaction time
all_data_df$RT_static <- all_data_df$trigger_time - all_data_df$user_ready_time  

# log tranform rt
all_data_df$RT_static_log <- log(all_data_df$RT_static)


#### test
# what´s the difference between user_ready_time, trigger_time, click time?
all_data_df$RT2 <- (all_data_df$click_time - all_data_df$user_ready_time)  
summary(all_data_df$RT2) 
all_data_df$RT3 <- (all_data_df$trigger_time - all_data_df$user_ready_time)  
summary(all_data_df$RT3) 

# RT dynamic
all_data_df$RT_dynamic <- (all_data_df$trigger_time - all_data_df$session_start_time) - (all_data_df$transition_after*1000)
all_data_df$RT1 <- (all_data_df$click_time - all_data_df$trigger_time) - (all_data_df$transition_after*1000)





##### Data formatting ##################################

columns_to_convert <- c("id", "participant_id", "computer_uuid", "chart_type", "data_source", 
                        "test_phase", "session_index", "session_type", "number_of_charts", "unique_chart_index",
                        "unique_chart_state", "participant_answer_index", "participant_answer_state")

all_data_df[,columns_to_convert] <- lapply(all_data_df[,columns_to_convert] , factor)



 
##### check uknown dynamic 8, 32, 72 #######################
data_uknown_df <- all_data_df[all_data_df$is_dynamic == TRUE & 
                                all_data_df$test_phase == "performanceB" ,] 

# remove empty rows
data_uknown_df <- data_uknown_df[rowSums(is.na(data_uknown_df)) != ncol(data_uknown_df), ]
# remove 219652, eid, 8
# remove 67462, ibq, 8
# remove 319200, ibq, 8
# remove 325959, ibc, 8
# remove 325959, ibc, 72
# remove 406553, eid, 8
# remove 406553, eid, 32
# remove 491839, ibc, 8
# remove 491957, eid, 8
# remove 523065, eid, 8
# remove 546780, ibc, 8
# remove 649136, ibq, 8
# remove 724868, ibq, 8
# remove 768182, ibc, 32
# remove 781121, eid, 8
# remove 880235, ibq, 8
 
summary(data_uknown_df)


# aggregate per person, per display type, per number_charts, per accuracy
agg_accuracy_ID <- data_uknown_df %>%
  group_by(participant_id, chart_type, number_of_charts, accuracy2) %>%
  summarize(frequency=n(), accuracy_proportion=n()/4) %>%
  filter(accuracy2 == TRUE)

# accuracy per chart_type, number_of_charts
agg_accuracy_tot <- data_uknown_df %>%
  group_by(chart_type, number_of_charts, accuracy2) %>%
  summarize(frequency=n(), accuracy_proportion=n()/40) %>%
  filter(accuracy2 == TRUE)



# Check RT, only accurate cases
data_unknown_RT_df <- data_uknown_df[data_uknown_df$accuracy2==TRUE,]

# aggregate per person, per display type, per number_charts
agg_RT_ID <- data_unknown_RT_df %>%
  group_by(participant_id, chart_type, number_of_charts) %>%
  summarize(freq=n(), rt_median_d=median(RT_dynamic), rt1_median=median(RT1))

# accuracy per data_unknown_RT_df, number_of_charts
agg_RT_tot <- data_unknown_RT_df %>%
  group_by(chart_type, number_of_charts) %>%
  summarize(freq=n(), rt_median_d=median(RT_dynamic), rt1_median=median(RT1))




##### check known static 8, 32, 72 #######################
data_known_df <- all_data_df[all_data_df$is_dynamic == FALSE &
                               (all_data_df$test_phase == "performanceB" |
                                  all_data_df$test_phase == "performanceA") ,] 

# remove empty rows
data_known_df <- data_known_df[rowSums(is.na(data_known_df)) != ncol(data_known_df), ]

summary(data_known_df)

 
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





# Check RT, only accurate cases
data_known_RT_df <- data_known_df[data_known_df$accuracy==TRUE,]

# remove 861964, 72, performanceB
# remove 768182, 72, performanceA
# remove 491839, 72, performanceA
# remove 325959 ,8, performanceB
# remove 151658, 72, performanceA
# remove 523065, 32, performanceB
# remove, 491839, 8, performanceB


# aggregate per person, per display type, per number_charts
agg_RT_ID <- data_known_RT_df %>%
  group_by(participant_id, chart_type, number_of_charts, test_phase) %>%
  summarize(rt_median=median(RT_static), rt_mean=mean(RT_static))

# accuracy per chart_type, number_of_charts
agg_RT_tot <- data_known_RT_df %>%
  group_by(chart_type, number_of_charts, test_phase) %>%
  summarize(mean_rt = mean(RT_static),
            median_rt = median(RT_static),
            SD_rt = sd(RT_static),
            min_rt = min(RT_static),
            max_rt = max(RT_static)
            )


# check outliers
rt_outliers <- data_known_RT_df %>%
  group_by(chart_type, number_of_charts, test_phase) %>%
  identify_outliers(RT_static_log)

# remove extreme
data_known_RT_df <- data_known_RT_df[!(data_known_RT_df$RT_static_log  %in% rt_outliers$RT_static_log ),]



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



##### Accuracy ##############################

summary(all_data_df$accuracy)

accuracy_table <- table(all_data_df$chart_type, all_data_df$accuracy, group=all_data_df$number_of_charts, all_data_df$test_phase)
accuracy_table


# aggregate per person, per display type, per number_charts, per accuracy
agg_accuracy_ID <- all_data_df %>%
  group_by(participant_id, chart_type, number_of_charts, test_phase, session_type, is_dynamic, accuracy) %>%
  summarize(frequency=n(), accuracy_proportion=n()/4, rt_mean=mean(RT)) %>%
  filter(accuracy == TRUE)


# accuracy per chart_type, number_of_charts
agg_accuracy_tot <- all_data_df %>%
  group_by(chart_type, number_of_charts, test_phase, session_type, is_dynamic, accuracy) %>%
  summarize(frequency=n(), accuracy_proportion=n()/40, rt_mean=mean(RT)) %>%
  filter(accuracy == TRUE)

# plot
ggplot(data = data_static_32_8_df, aes(x = accuracy)) +
  geom_bar(position = 'dodge') +
  facet_grid(number_of_charts ~ chart_type) +
  labs(x = "TRUE = accurate",  
       fill = " ",  
       y = "Accuracy cound",  
       title = " ") 


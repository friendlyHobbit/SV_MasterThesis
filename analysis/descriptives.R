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


#### test
# what´s the difference between user_ready_time, trigger_time, click time?
all_data_df$RT2 <- (all_data_df$click_time - all_data_df$user_ready_time)  
summary(all_data_df$RT2) 
all_data_df$RT3 <- (all_data_df$trigger_time - all_data_df$user_ready_time)  
summary(all_data_df$RT3) 

# RT dynamic
all_data_df$RT_dynamic <- (all_data_df$trigger_time - all_data_df$session_start_time) - (all_data_df$transition_after*1000)
all_data_df$RT1 <- (all_data_df$click_time - all_data_df$trigger_time) - (all_data_df$transition_after*1000)


summary(all_data_df$RT_dynamic)
summary(all_data_df$RT_static)



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
  group_by(chart_type, number_of_charts, is_dynamic, test_phase) %>%
  summarise(frequency=n(), rt_median=median(RT_static), rt_mean=mean(RT_static))
RTperCondition_df

# check which participant has missing data
check_ID_df <- all_data_df %>%
  group_by(participant_id) %>%
  summarise(frequency=n())
check_ID_df






##### Accuracy descriptives ############################

# aggregate per person, per display type, per dynamic, per number_charts, per accuracy
agg_accuracy_ID <- all_data_df %>%
  group_by(participant_id, chart_type, number_of_charts, test_phase, accuracy) %>%
  summarize(frequency=n(), accuracy_proportion=n()/4) %>%
  filter(accuracy == "correct")

# accuracy per chart_type, number_of_charts
agg_accuracy_tot <- all_data_df %>%
  group_by(chart_type, number_of_charts, test_phase, accuracy) %>%
  summarize(frequency=n(), accuracy_proportion=n()/40) %>%
  filter(accuracy == "correct")


# bar plot accuracy
ggplot(data = all_data_df, aes(x = test_phase, fill=accuracy)) +
  geom_bar(position = 'fill') +
  facet_grid(number_of_charts ~ chart_type) +
  labs(x = "Test phase",  
       fill = "Accuracy",  
       y = "proportion",  
       title = " ") +
  theme(axis.text.x = element_text(angle = 45, hjust=1, vjust=1))



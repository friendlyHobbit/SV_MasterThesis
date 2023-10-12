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


# Data formatting 
columns_to_convert <- c("id", "participant_id", "computer_uuid", "chart_type", "data_source", 
                        "test_phase", "session_index", "session_type", "number_of_charts", "unique_chart_index",
                        "unique_chart_state", "participant_answer_index", "participant_answer_state")

all_data_df[,columns_to_convert] <- lapply(all_data_df[,columns_to_convert] , factor)


# what´s the difference between user_ready_time, trigger_time, click time?
all_data_df$RT1 <- all_data_df$click_time - all_data_df$trigger_time 
summary(all_data_df$RT1)
all_data_df$RT2 <- all_data_df$click_time - all_data_df$user_ready_time  
summary(all_data_df$RT2) 
 
#exp_data_df$RT <- exp_data_df$trigger_time - exp_data_df$user_ready_time  



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


##### libraries ####
library(ggplot2)
library(ggpubr)
library(dplyr)
library(tidyr)
library(readr)
library(stringr)
library(gridExtra)


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

# calculating  accuracy
data_static_32_8_df$accuracy = ifelse(data_static_32_8_df$participant_answer_state == data_static_32_8_df$unique_chart_state, TRUE, FALSE) 

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



##### Descriptive statistics - accuracy

# check the data
check_df = subset(data_static_32_8_df, select = c(chart_type,participant_answer_index,unique_chart_index,accuracy) )


summary(data_static_32_8_df$accuracy)

accuracy_table <- table(data_static_32_8_df$chart_type, data_static_32_8_df$accuracy, group=data_static_32_8_df$number_of_charts)
accuracy_table


# aggregate per person, per display type, per number_charts, per accuracy
agg_accuracy_83_8 <- data_static_32_8_df %>%
  group_by(participant_id, chart_type, number_of_charts, accuracy) %>%
  summarize(frequency=n(), accuracy_proportion=n()/4) %>%
  filter(accuracy == TRUE)





##### Descriptive statistics - RT #####################

# Calculating latency
data_static_32_8_df$RT <- data_static_32_8_df$click_time - data_static_32_8_df$user_ready_time
data_static_32_8_df$RT1 <- data_static_32_8_df$trigger_time - data_static_32_8_df$user_ready_time   ## this is probably the correct one
data_static_32_8_df$RT2 <- data_static_32_8_df$click_time - data_static_32_8_df$trigger_time 

summary(data_static_32_8_df$RT)
summary(data_static_32_8_df$RT1)
summary(data_static_32_8_df$RT2)


# aggregate so there is 1 value per person
agg_32_8 <- data_static_32_8_df %>%
  group_by(participant_id, chart_type, number_of_charts) %>%
  summarize(rt_mean=mean(RT), rt1_mean=mean(RT1), rt2_mean=mean(RT2), rt_median=median(RT), rt1_median=median(RT1), rt2_median=median(RT2), frequency=n())

agg_median_32_8 <- agg_32_8 %>%
  group_by(chart_type, number_of_charts) %>%
  summarize(frequency=n(), rt_m=median(rt_median), rt1_m=median(rt1_median), rt2_m=median(rt2_median))


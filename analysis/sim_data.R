
######### Load packages ###############

library(jsonlite)
library(dplyr)




######### import data ###########

# location of files 
#data_dir <- "C:\\Git\\SV_MasterThesis\\analysis\\dynamic_unknown_simoutput"
data_dir <- "H:\\git\\SV_MasterThesis\\analysis\\dynamic_unknown_simoutput"

# get list of files in folder
files <- list.files(data_dir, full.names = TRUE)
files

# df to put data in
data_df <- data.frame()

# import files
for(f in files){
  f_data <- fromJSON(f, flatten = TRUE)
  frames_df <- f_data[['frames']]
  
  # put all data in df, except frames
  f_data[['frames']] <- NULL
  temp_df1 <-  as.data.frame(do.call(cbind, f_data))
  
  # bind temp_df and frames_df
  merged_df <- data.frame()
  
  for(i in rownames(frames_df)){
    temp_df2 <- merge(frames_df[i,], temp_df1)
    merged_df <- rbind(merged_df, temp_df2)
  }
  # bind all data in global df
  data_df <- rbind(data_df, merged_df)
}
# drop some collumns 
data_df <- subset(data_df, select = -c(participantAnswerIndex, participantId, participantAnswerState, testPhase, 
                                       chartType, transitionStarted, sessionType, dataSource, computerUuid))





############## check for accidental unique states #############################

data_df$UniqueStatePresent <- FALSE
data_df$TrueUniqueState <- 0
data_df$TrueUniqueChartIndex <- 0


# loop through data_df
for(i in rownames(data_df)){
  temp_states <- data_df[[i, "charts"]]

  # is there a unique state?
  states_table <- table(temp_states$state.state)
  print(states_table)
  
  # Check if there’s a unique state
  if (1 %in% states_table) {
    unique_state <- names(states_table)[states_table == 1]              # Identify the unique state
    print(paste("Unique state:", unique_state))                         # Print the unique state(s)
    temp_row <- temp_states[temp_states$state.state == unique_state, ]  # find row that belongs to TrueUniqueState
    temp_index <- temp_row$index                                        # get chart index
    
    # Add info to df
    data_df[[i, "UniqueStatePresent"]] <- TRUE
    data_df[[i, "TrueUniqueState"]] <- paste(unique_state, collapse = ", ")  # If there are multiple unique states
    data_df[[i, "TrueUniqueChartIndex"]] <- paste(temp_index, collapse = ", ")  # If there are multiple unique states
  } else {
    data_df[[i, "UniqueStatePresent"]] <- FALSE
    data_df[[i, "TrueUniqueState"]] <- NA
    data_df[[i, "TrueUniqueChartIndex"]] <- NA
  }
}


# drop column so it can be exported
data_df <- subset(data_df, select = -c(charts))


############## Export dataframe #############################

str(data_df)

data_df$sessionIndex <- unlist(data_df$sessionIndex, recursive = TRUE, use.names = TRUE)
data_df$clickTime <- unlist(data_df$clickTime, recursive = TRUE, use.names = TRUE)
data_df$uniqueChartIndex <- unlist(data_df$uniqueChartIndex, recursive = TRUE, use.names = TRUE)   
data_df$triggerTime <- unlist(data_df$triggerTime, recursive = TRUE, use.names = TRUE)   
data_df$isDynamic <- unlist(data_df$isDynamic, recursive = TRUE, use.names = TRUE)   
data_df$numberOfCharts <- unlist(data_df$numberOfCharts, recursive = TRUE, use.names = TRUE) 
data_df$sessionStartTime <- unlist(data_df$sessionStartTime, recursive = TRUE, use.names = TRUE) 
data_df$transitionAfter <- unlist(data_df$transitionAfter, recursive = TRUE, use.names = TRUE) 
data_df$sessionIndex <- unlist(data_df$sessionIndex, recursive = TRUE, use.names = TRUE) 
data_df$uniqueChartState <- unlist(data_df$uniqueChartState, recursive = TRUE, use.names = TRUE)      

write.csv(data_df, file.path(data_dir, "sim_results.csv"))













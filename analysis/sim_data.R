
######### Load packages ###############

library(jsonlite)
library(dplyr)


######### import data ###########

# location of files 
data_dir <- "C:\\Git\\SV_MasterThesis\\analysis\\dynamic_unknown_simoutput"

# get list of files in folder
files <- list.files(data_dir, full.names = TRUE)

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



############## check for accidental unique states #############################

data_df$UniqueStatePresent <- FALSE

# loop through data_df
for(i in rownames(data_df)){
  print(data_df[i, "state"])
}


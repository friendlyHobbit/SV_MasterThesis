class AnswersController < ApplicationController

  def record
    answer = Answer.new

    answer.participant_id           = params[:participantId]
    answer.computer_uuid            = params[:computerUuid]
    answer.chart_type               = params[:chartType]
    answer.data_source              = params[:dataSource]
    answer.test_phase               = params[:testPhase]
    answer.session_index            = params[:sessionIndex]
    answer.session_type             = params[:sessionType]
    answer.session_start_time       = params[:sessionStartTime]
    answer.number_of_charts         = params[:numberOfCharts]
    answer.is_dynamic               = params[:isDynamic]
    answer.transition_after         = params[:transitionAfter]
    answer.unique_chart_index       = params[:uniqueChartIndex]
    answer.unique_chart_state       = params[:uniqueChartState]
    answer.trigger_time             = params[:triggerTime]
    answer.transition_started       = params[:transitionStarted]
    answer.click_time               = params[:clickTime]
    answer.participant_answer_index = params[:participantAnswerIndex]
    answer.participant_answer_state = params[:participantAnswerState]
    answer.sequential_chart_answers = params[:sequentialChartAnswers]

    if answer.save
      render json: {}, status: :ok
    else
      render json: {}, status: :unprocessable_entity
    end
  end

end
